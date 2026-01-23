import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, MessageSquare, Edit, Check, X, Clock } from 'lucide-react';
import { 
  getTemplates, 
  updateTemplate, 
  getNotificationHistory, 
  getPendingApprovals, 
  approveNotification, 
  rejectNotification, 
  updatePendingNotification,
  NotificationTemplate, 
  Notification 
} from '@/services/notificationService';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('pending');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);
  const [pending, setPending] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Pending Edit State
  const [selectedPending, setSelectedPending] = useState<Notification | null>(null);
  const [isPendingEditDialogOpen, setIsPendingEditDialogOpen] = useState(false);
  const [pendingSubject, setPendingSubject] = useState('');
  const [pendingContent, setPendingContent] = useState('');

  // Template Form state
  const [editSubject, setEditSubject] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'history') {
        const data = await getNotificationHistory();
        setHistory(data);
      } else if (activeTab === 'pending') {
        const data = await getPendingApprovals();
        setPending(data);
      } else {
        const data = await getTemplates();
        setTemplates(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveNotification(id);
      toast({ title: "Approved", description: "Notification has been queued for sending." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve notification", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectNotification(id);
      toast({ title: "Rejected", description: "Notification has been rejected." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject notification", variant: "destructive" });
    }
  };

  const handleEditPending = (notification: Notification) => {
    setSelectedPending(notification);
    setPendingSubject(notification.subject || '');
    setPendingContent(notification.content);
    setIsPendingEditDialogOpen(true);
  };

  const handleSavePending = async () => {
    if (!selectedPending) return;
    setSaving(true);
    try {
      await updatePendingNotification(selectedPending.id, {
        subject: pendingSubject,
        content: pendingContent
      });
      toast({ title: "Updated", description: "Notification updated successfully" });
      setIsPendingEditDialogOpen(false);
      fetchData();
    } catch (error) {
       toast({ title: "Error", description: "Failed to update notification", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setEditSubject(template.subject || '');
    setEditContent(template.content);
    setEditIsActive(template.isActive);
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    try {
      await updateTemplate(selectedTemplate.id, {
        subject: editSubject,
        content: editContent,
        isActive: editIsActive
      });
      
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      
      setIsEditDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Manage SMS and Email communications</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock size={16} /> Pending Approvals
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve outgoing notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No pending notifications</TableCell>
                      </TableRow>
                    ) : (
                      pending.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {item.type === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.recipient}</TableCell>
                          <TableCell className="max-w-md">
                            <div className="font-semibold text-xs mb-1">{item.subject}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">{item.content}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(item.id)} title="Approve & Send">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditPending(item)} title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(item.id)} title="Reject">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Notifications</CardTitle>
              <CardDescription>Recent emails and SMS messages sent to customers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject/Preview</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No notifications found</TableCell>
                      </TableRow>
                    ) : (
                      history.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {item.type === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.recipient}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.subject || item.content}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(item.status)} text-white border-0`}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-8">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              No templates found
            </div>
          ) : (
            <>
              {/* SMS Templates Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">SMS Templates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates
                    .filter(t => t.type === 'SMS')
                    .map((template) => (
                      <Card key={template.id} className="overflow-hidden border-l-4 border-l-primary/50">
                        <CardHeader className="bg-muted/30 pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </CardTitle>
                              <CardDescription>
                                {template.isActive ? (
                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                                )}
                              </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(template)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div>
                            <span className="font-semibold text-xs text-muted-foreground uppercase">Message:</span>
                            <p className="text-sm line-clamp-3 text-muted-foreground mt-1 bg-muted p-2 rounded text-xs font-mono">
                              {template.content}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {Array.isArray(template.variables) && template.variables.map((v: string) => (
                              <Badge key={v} variant="secondary" className="text-[10px]">
                                {`{${v}}`}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Email Templates Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Mail className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">Email Templates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates
                    .filter(t => t.type === 'EMAIL')
                    .map((template) => (
                      <Card key={template.id} className="overflow-hidden border-l-4 border-l-blue-500/50">
                        <CardHeader className="bg-muted/30 pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </CardTitle>
                              <CardDescription>
                                {template.isActive ? (
                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                                )}
                              </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(template)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {template.subject && (
                            <div className="mb-2">
                              <span className="font-semibold text-xs text-muted-foreground uppercase">Subject:</span>
                              <p className="text-sm truncate">{template.subject}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-xs text-muted-foreground uppercase">Content Preview:</span>
                            <p className="text-sm line-clamp-3 text-muted-foreground mt-1 bg-muted p-2 rounded text-xs font-mono">
                              {template.content}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {Array.isArray(template.variables) && template.variables.map((v: string) => (
                              <Badge key={v} variant="secondary" className="text-[10px]">
                                {`{${v}}`}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Pending Notification Edit Dialog */}
      <Dialog open={isPendingEditDialogOpen} onOpenChange={setIsPendingEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPending?.type === 'EMAIL' && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={pendingSubject} onChange={(e) => setPendingSubject(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                value={pendingContent} 
                onChange={(e) => setPendingContent(e.target.value)} 
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPendingEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePending} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save & Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="active-mode" 
                checked={editIsActive} 
                onCheckedChange={setEditIsActive} 
              />
              <Label htmlFor="active-mode">Enable this notification</Label>
            </div>

            {selectedTemplate?.type === 'EMAIL' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  value={editSubject} 
                  onChange={(e) => setEditSubject(e.target.value)} 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="content">
                Content 
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  (HTML allowed for emails)
                </span>
              </Label>
              <Textarea 
                id="content" 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20">
                {Array.isArray(selectedTemplate?.variables) && selectedTemplate?.variables.map((v: string) => (
                  <Badge 
                    key={v} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setEditContent(prev => prev + ` {${v}}`)}
                  >
                    {`{${v}}`}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Click a variable to insert it at the end of the content.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
