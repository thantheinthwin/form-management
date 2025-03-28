'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Loader2, Eye, UserPlus, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { UserAssignmentDialog } from '@/components/forms/user-assignment-dialog';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

interface UserResponse {
  assignment_id: number;
  user_id: number;
  email: string;
  status: 'pending' | 'completed';
  submitted_at: string | null;
  response_data: any | null;
  questions?: Question[];
}

interface Question {
  text: string;
  type: string;
  order: number;
  options: string[];
  required: boolean;
}

export default function FormResponsesPage() {
  const params = useParams();
  const formId = Number(params.id);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<UserResponse | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);

  console.log("selectedResponse", selectedResponse);

  useEffect(() => {
    // Fetch form details
    const fetchFormDetails = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (response.ok) {
          const formData = await response.json();
          setFormTitle(formData.title);
        }
      } catch (error) {
        console.error('Error fetching form details:', error);
      }
    };

    // Fetch responses
    const fetchResponses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/forms/${formId}/responses`);
        if (response.ok) {
          const data = await response.json();
          setResponses(data.responses || []);
        }
      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormDetails();
    fetchResponses();
  }, [formId]);

  const pendingResponses = responses.filter(r => r.status === 'pending');
  const completedResponses = responses.filter(r => r.status === 'completed');

  const handleViewResponse = (response: UserResponse) => {
    setSelectedResponse(response);
    setShowResponseDialog(true);
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div className='grid gap-4'>
          <div className="flex items-center gap-2">
            <Link href="/forms" className="text-muted-foreground hover:text-foreground">Forms</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href={`/forms/${formId}`} className="text-muted-foreground hover:text-foreground">{formTitle}</Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Responses</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Responses | {formTitle}</h1>
          <p className="text-muted-foreground">
            Track form submissions and manage assignments
          </p>
        </div>
        <Button onClick={() => setIsAssignDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Summary</CardTitle>
          <CardDescription>
            Overview of form response status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{responses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedResponses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingResponses.length}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({responses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedResponses.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingResponses.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <ResponseTable 
              responses={responses} 
              loading={loading} 
              onViewResponse={handleViewResponse} 
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <ResponseTable 
              responses={completedResponses} 
              loading={loading} 
              onViewResponse={handleViewResponse} 
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            <ResponseTable 
              responses={pendingResponses} 
              loading={loading} 
              onViewResponse={handleViewResponse} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Response detail dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div className='flex flex-col gap-2'>
                <DialogTitle>Response Details</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedResponse?.email || 'Unknown User'}
                  {selectedResponse?.submitted_at && ` on ${format(new Date(selectedResponse.submitted_at), 'PPP p')}`}
                </DialogDescription>
              </div>
              {selectedResponse && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportResponseToCSV(selectedResponse, formId, formTitle)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {selectedResponse ? (
            <div className="max-h-[calc(80vh-200px)] overflow-y-auto">
              <ResponseDisplay data={selectedResponse} />
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No response data available
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User assignment dialog */}
      <UserAssignmentDialog 
        formId={formId}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onAssignmentComplete={() => {
          // Refresh the responses list after new assignments
          setLoading(true);
          fetch(`/api/forms/${formId}/responses`)
            .then(res => res.json())
            .then(data => {
              setResponses(data.responses || []);
              setLoading(false);
            })
            .catch(err => {
              console.error('Error refreshing responses:', err);
              setLoading(false);
            });
        }}
      />
    </div>
  );
}

// Helper component for the response table
function ResponseTable({ 
  responses, 
  loading, 
  onViewResponse 
}: { 
  responses: UserResponse[], 
  loading: boolean,
  onViewResponse: (response: UserResponse) => void
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (responses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses to display
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.assignment_id}>
              <TableCell className="font-medium">{response.email}</TableCell>
              <TableCell>
                <Badge variant={response.status === 'completed' ? 'success' : 'outline'}>
                  {response.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell>
                {response.submitted_at 
                  ? format(new Date(response.submitted_at), 'PP')
                  : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewResponse(response)}
                  disabled={!response.response_data}
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper component for displaying response data
function ResponseDisplay({ data }: { data: any }) {
  if (!data) return null;
  
  // Check if data contains both response_data and questions
  const answers = Array.isArray(data.response_data) ? data.response_data : [];
  const questions = Array.isArray(data.questions) ? data.questions : [];
  
  // Match answers with questions
  return (
    <div className="space-y-4">
      {answers.map((answer: any) => {
        const question = questions.find((q: Question) => q.order === answer.questionId);
        return (
          <div key={answer.questionId} className="border p-4 rounded-md grid gap-2">
            <div className='flex justify-between'>
              <div>
                <h3 className='text-sm text-muted-foreground'>Question</h3>
                <div className="font-medium mb-1">{question?.text || `Question ${answer.questionId}`}</div>
              </div>
              <div className="text-sm text-muted-foreground mb-2">Type: {question?.type || 'Unknown'}</div>
            </div>
            <Separator />
            <div>
              <h3 className='text-sm text-muted-foreground'>Answer</h3>
              <div className="mt-2">
                {typeof answer.answer === 'string' ? (
                  <p>{answer.answer}</p>
                ) : Array.isArray(answer.answer) ? (
                  <ul className="list-disc pl-5">
                    {answer.answer.map((item: any, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(answer.answer, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to export response to CSV
function exportResponseToCSV(response: UserResponse, formId: number, formTitle: string) {
  if (!response.response_data || !response.questions) return;
  
  try {
    const answers = Array.isArray(response.response_data) ? response.response_data : [];
    const questions = Array.isArray(response.questions) ? response.questions : [];
    
    // Create CSV content
    let csvContent = "Question,Type,Answer\n";
    
    for (const answer of answers) {
      const question = questions.find((q: Question) => q.order === answer.questionId);
      if (!question) continue;
      
      let answerText = '';
      
      if (typeof answer.answer === 'string') {
        answerText = answer.answer;
      } else if (Array.isArray(answer.answer)) {
        answerText = answer.answer.join(', ');
      } else {
        answerText = JSON.stringify(answer.answer);
      }
      
      // Escape quotes in fields
      const questionText = question.text.replace(/"/g, '""');
      const questionType = question.type.replace(/"/g, '""');
      answerText = answerText.replace(/"/g, '""');
      
      // Add the row with proper CSV escaping
      csvContent += `"${questionText}","${questionType}","${answerText}"\n`;
    }
    
    // Create a download link and trigger click
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // Sanitize form title for filename (replace spaces and special characters)
    const sanitizedFormTitle = formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${sanitizedFormTitle}-${response.user_id}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting response to CSV:', error);
    alert('Failed to export response to CSV');
  }
} 