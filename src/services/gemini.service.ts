
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const apiKey = process.env['API_KEY'];
      if (!apiKey) {
        console.warn('No API KEY found');
        return 'وصف تجريبي للمنتج (الرجاء إضافة مفتاح API لتوليد الوصف تلقائياً)';
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `اكتب وصفًا تسويقيًا جذابًا وقصيرًا (حوالي 30 كلمة) باللغة العربية لمنتج باسم: "${productName}" في فئة "${category}". ركز على المميزات.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text.trim();
    } catch (e) {
      console.error('Gemini Error', e);
      return 'لم نتمكن من توليد الوصف حالياً.';
    }
  }
}
