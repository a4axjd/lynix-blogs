
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchNewsletterLogs, fetchNewsletterSubscribers } from "@/lib/supabase-blogs";
import { NewsletterLog, NewsletterSubscriber } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";

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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Newsletter Management</CardTitle>
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin opacity-70" />
          </div>
        ) : activeTab === "subscribers" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length > 0 ? (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b">
                      <td className="px-4 py-2">{subscriber.email}</td>
                      <td className="px-4 py-2">
                        {format(new Date(subscriber.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          subscriber.confirmed 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {subscriber.confirmed ? "Confirmed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No subscribers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">Blog</th>
                  <th className="px-4 py-2 text-left font-medium">Sent</th>
                  <th className="px-4 py-2 text-left font-medium">Recipients</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-4 py-2 max-w-[200px] truncate">
                        {log.blogs?.title || "Deleted post"}
                      </td>
                      <td className="px-4 py-2">
                        {format(new Date(log.sent_at), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="px-4 py-2">{log.recipients_count}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === "completed" 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No newsletter logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {activeTab === "subscribers" 
              ? `Total subscribers: ${subscribers.length}` 
              : `Total newsletters sent: ${logs.length}`}
          </p>
          {activeTab === "subscribers" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-1" />
              <span>
                {subscribers.filter(sub => sub.confirmed).length} confirmed subscribers
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterManagement;
