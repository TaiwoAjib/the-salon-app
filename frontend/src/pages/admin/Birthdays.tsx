import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Mail, MessageSquare, Calendar, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { birthdayService, User } from '@/services/birthdayService';

export default function Birthdays() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({}); // key: userId-type

    useEffect(() => {
        loadBirthdays();
    }, []);

    const loadBirthdays = async () => {
        try {
            setLoading(true);
            const data = await birthdayService.getUpcomingBirthdays();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load upcoming birthdays",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendGreeting = async (userId: string, type: 'email' | 'sms') => {
        const key = `${userId}-${type}`;
        setSendingMap(prev => ({ ...prev, [key]: true }));
        try {
            await birthdayService.sendGreeting(userId, type);
            toast({
                title: "Success",
                description: `${type === 'email' ? 'Email' : 'SMS'} greeting sent successfully!`
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to send greeting",
                variant: "destructive"
            });
        } finally {
            setSendingMap(prev => ({ ...prev, [key]: false }));
        }
    };

    const getMonthName = (month: number) => {
        return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
    };

    const isToday = (day: number, month: number) => {
        const today = new Date();
        return today.getDate() === day && (today.getMonth() + 1) === month;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Birthdays</h1>
                    <p className="text-muted-foreground">Upcoming customer birthdays for this month and next.</p>
                </div>
                <Button variant="outline" onClick={loadBirthdays} disabled={loading}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Birthdays</CardTitle>
                    <CardDescription>
                        Send automated birthday greetings to your customers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No upcoming birthdays found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Birthday</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{getMonthName(user.birthMonth!)} {user.birthDay}</span>
                                                {isToday(user.birthDay!, user.birthMonth!) && (
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Today!</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {user.phone || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleSendGreeting(user.id, 'email')}
                                                disabled={sendingMap[`${user.id}-email`]}
                                            >
                                                {sendingMap[`${user.id}-email`] ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Mail className="h-4 w-4 mr-1" />
                                                )}
                                                Email
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleSendGreeting(user.id, 'sms')}
                                                disabled={!user.phone || sendingMap[`${user.id}-sms`]}
                                            >
                                                {sendingMap[`${user.id}-sms`] ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                )}
                                                SMS
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
