
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchNewsletterLogs, fetchNewsletterSubscribers } from "@/lib/supabase-blogs";
import { NewsletterLog, NewsletterSubscriber } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mail, RefreshCw, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [logs, setLogs] = useState<NewsletterLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscribers" | "logs">("subscribers");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subscribersData, logsData] = await Promise.all([
        fetchNewsletterSubscribers(),
        fetchNewsletterLogs()
      ]);
      
      setSubscribers(subscribersData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error loading newsletter data:", error);
      toast({
        title: "Error",
        description: "Failed to load newsletter data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mt-8">
      <Separator className="my-8" />
      
      <h2 className="text-3xl font-bold mb-6">Newsletter Management</h2>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Newsletter Dashboard</CardTitle>
              <CardDescription>
                Manage your newsletter subscribers and view send history
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadData} size="sm">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
          <div className="flex space-x-1 mt-2">
            <Button
              variant={activeTab === "subscribers" ? "default" : "outline"}
              onClick={() => setActiveTab("subscribers")}
            >
              Subscribers ({subscribers.length})
            </Button>
            <Button
              variant={activeTab === "logs" ? "default" : "outline"}
              onClick={() => setActiveTab("logs")}
            >
              Send Logs ({logs.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === "subscribers" && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>About Subscriber Status</AlertTitle>
              <AlertDescription>
                New subscribers have a "Pending" status until they confirm their email address. In a production environment, 
                an email confirmation link would be sent to verify their address. For this demo, all new subscriptions start as pending.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin opacity-70" />
            </div>
          ) : activeTab === "subscribers" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length > 0 ? (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>
                          {format(new Date(subscriber.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            subscriber.confirmed 
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {subscriber.confirmed ? "Confirmed" : "Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {subscribers.length > 0 && (
                  <TableCaption>
                    Total of {subscribers.length} subscribers, {subscribers.filter(sub => sub.confirmed).length} confirmed
                  </TableCaption>
                )}
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blog Post</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="max-w-[200px] truncate">
                          {log.blogs?.title || "Deleted post"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.sent_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{log.recipients_count}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            log.status === "completed" 
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {log.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No newsletter logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {logs.length > 0 && (
                  <TableCaption>
                    Total of {logs.length} newsletters sent
                  </TableCaption>
                )}
              </Table>
            </div>
          )}
          
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="faq">
              <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Why are new subscribers shown as "Pending"?</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      In a production environment, subscribers need to confirm their email address via a verification link. 
                      This prevents fake signups and ensures delivery to valid addresses. For this demo, all new subscribers 
                      start as "Pending".
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">How are newsletters sent?</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      When a blog post is created or updated with the "Send newsletter" option checked, 
                      a Supabase Edge Function is triggered that sends emails to all confirmed subscribers.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterManagement;
