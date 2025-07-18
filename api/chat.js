// هذا الكود يوضع في ملف asil-brain/api/chat.js

import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // 1. إعداد CORS للسماح بالطلبات من أي نطاق
    // هذا يسمح لموقعك على Hostinger بالتحدث مع هذا الخادم على Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. التعامل مع طلبات OPTIONS (جزء من بروتوكول CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. التأكد من أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { history, message, systemInstruction } = req.body;
        if (!history || !message || !systemInstruction) {
            return res.status(400).json({ error: 'History, message, and systemInstruction are required.' });
        }

        // 4. قراءة مفتاح API بأمان من متغيرات البيئة في Vercel
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set on Vercel.");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                { role: 'model', parts: [{ text: 'بالتأكيد، فهمت. أنا جاهزة للإجابة على الأسئلة المتعلقة بمجتبى.' }] },
                ...history
            ]
        });

        const result = await chat.sendMessage({ message: message });
        
        // 5. إرسال الرد مرة أخرى إلى موقعك
        res.status(200).json({ text: result.text });

    } catch (error) {
        console.error('Error in Vercel function:', error);
        res.status(500).json({ error: 'Failed to communicate with the AI model.' });
    }
}