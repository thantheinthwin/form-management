'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Check } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  name: string;
}

interface UserAssignmentDialogProps {
  formId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentComplete?: () => void;
}

export function UserAssignmentDialog({
  formId,
  open,
  onOpenChange,
  onAssignmentComplete
}: UserAssignmentDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentAssignees, setCurrentAssignees] = useState<number[]>([]);

  // Fetch available users and current assignments when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchCurrentAssignments();
    } else {
      // Reset state when dialog closes
      setSelectedUsers([]);
      setSearchQuery('');
    }
  }, [open, formId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAssignments = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/responses`);
      if (response.ok) {
        const data = await response.json();
        // Extract user IDs from responses
        const assignedUserIds = data.responses.map((response: any) => response.user_id);
        setCurrentAssignees(assignedUserIds);
      }
    } catch (error) {
      console.error('Error fetching current assignments:', error);
    }
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${formId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      if (response.ok) {
        toast.success('Users assigned successfully');
        onOpenChange(false);
        if (onAssignmentComplete) {
          onAssignmentComplete();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign users');
      }
    } catch (error) {
      toast.error('An error occurred while assigning users');
      console.error('Error assigning users:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (filteredUsers.length === selectedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserAssigned = (userId: number) => currentAssignees.includes(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Users to Form</DialogTitle>
          <DialogDescription>
            Select users to assign this form to. Users will be notified when assigned.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={filteredUsers.length > 0 && filteredUsers.length === selectedUsers.length}
                        onCheckedChange={toggleAllUsers}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {isUserAssigned(user.id) && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Check className="h-3 w-3 mr-1" />
                              Assigned
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={submitting || selectedUsers.length === 0}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Selected Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 