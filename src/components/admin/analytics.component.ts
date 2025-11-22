
import { Component, inject, computed, ElementRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { DataService, Order } from '../../services/data.service';

declare const d3: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  template: `
    <h1 class="text-2xl font-bold mb-6">التحليلات المتقدمة</h1>

    <!-- Revenue KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">إيرادات اليوم</div>
        <div class="text-2xl font-bold text-emerald-600">{{ revenueToday() }} د.ج</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">الأسبوع الماضي</div>
        <div class="text-2xl font-bold text-emerald-600">{{ revenueWeek() }} د.ج</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">الشهر الماضي</div>
        <div class="text-2xl font-bold text-emerald-600">{{ revenueMonth() }} د.ج</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">الإجمالي الكلي</div>
        <div class="text-2xl font-bold text-emerald-800">{{ revenueAllTime() }} د.ج</div>
      </div>
    </div>

    <!-- Visitor Stats -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">حركة الزوار (آخر 30 يوم)</h2>
        <div class="flex gap-4 text-sm">
          <div class="flex flex-col">
             <span class="text-gray-500">اليوم</span>
             <span class="font-bold text-lg">{{ visitorsToday() }}</span>
          </div>
          <div class="flex flex-col border-r pr-4 mr-4 border-gray-200">
             <span class="text-gray-500">الإجمالي</span>
             <span class="font-bold text-lg">{{ visitorsTotal() }}</span>
          </div>
        </div>
      </div>
      
      <!-- D3 Chart Container -->
      <div #chartContainer class="w-full h-64 bg-gray-50 rounded relative"></div>
    </div>

    <div class="text-xs text-gray-400 text-center">
      * يتم تحديث إحصائيات الإيرادات بناءً على الطلبات "المكتملة" فقط.
    </div>
  `
})
export class AnalyticsComponent implements AfterViewInit {
  dataService = inject(DataService);
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor() {
    // Redraw chart if window resizes
    window.addEventListener('resize', () => this.drawChart());
  }

  // Revenue Calculations (Only Completed Orders)
  revenueAllTime = computed(() => this.calculateRevenue(this.dataService.orders()));

  revenueToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const orders = this.dataService.orders().filter(o => o.date.startsWith(today));
    return this.calculateRevenue(orders);
  });

  revenueWeek = computed(() => {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const orders = this.dataService.orders().filter(o => new Date(o.date) >= past);
    return this.calculateRevenue(orders);
  });

  revenueMonth = computed(() => {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const orders = this.dataService.orders().filter(o => new Date(o.date) >= past);
    return this.calculateRevenue(orders);
  });

  calculateRevenue(orders: Order[]): number {
    // Calculate based on total (including shipping) or subtotal? Usually revenue includes shipping if we pay for it, 
    // but profit is diff. Let's use Total for simplicity as "Revenue".
    return orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
  }

  // Visitor Calculations
  visitorsToday = computed(() => {
    const stats = this.dataService.visitorStats();
    return stats[stats.length - 1]?.count || 0;
  });

  visitorsTotal = computed(() => {
    return this.dataService.visitorStats().reduce((sum, d) => sum + d.count, 0);
  });

  ngAfterViewInit() {
    this.drawChart();
  }

  drawChart() {
    if (!this.chartContainer) return;
    const element = this.chartContainer.nativeElement;
    element.innerHTML = ''; // Clear previous

    const data = this.dataService.visitorStats();
    if (!data.length) return;

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = element.clientHeight - margin.top - margin.bottom;

    // SVG
    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d: any) => new Date(d.date)))
      .range([0, width]);

    // Y Scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.count)])
      .range([height, 0]);

    // Line
    const line = d3.line()
      .x((d: any) => x(new Date(d.date)))
      .y((d: any) => y(d.count))
      .curve(d3.curveMonotoneX); // Smooth curve

    // Add X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%d/%m")))
      .style('color', '#9ca3af');

    // Add Y Axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .style('color', '#9ca3af');

    // Add Line Path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981') // emerald-500
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add Area under line (Gradient)
    const area = d3.area()
      .x((d: any) => x(new Date(d.date)))
      .y0(height)
      .y1((d: any) => y(d.count))
      .curve(d3.curveMonotoneX);

    // Gradient defs
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.2);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0);

    svg.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)');
  }
}
