import { authService } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

export interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    birthDay: number | null;
    birthMonth: number | null;
}

export const birthdayService = {
    async getUpcomingBirthdays(): Promise<User[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/birthdays/upcoming`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch birthdays');
        return response.json();
    },

    async sendGreeting(userId: string, type: 'email' | 'sms'): Promise<{ message: string }> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/birthdays/greet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, type })
        });
        if (!response.ok) throw new Error('Failed to send greeting');
        return response.json();
    }
};
