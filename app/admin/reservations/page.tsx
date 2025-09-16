'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Search, Filter, Plus, Edit, X, Check, AlertTriangle, Clock, Users, Bed, CreditCard, Phone, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  confirmationNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  adults: number;
  children: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vipStatus: boolean;
  };
  hotel: {
    id: string;
    name: string;
  };
  roomType: {
    id: string;
    name: string;
  };
  room?: {
    roomNumber: string;
    floor: number;
  };
  specialRequests?: string;
  bookingSource: string;
  createdAt: string;
  tasks: Task[];
  communications: Communication[];
}

interface Task {
  id: string;
  type: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
}

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'call' | 'in_person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  sentAt: string;
  status: string;
}

interface Filters {
  status: string;
  hotel: string;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: string;
  guestName: string;
  confirmationNumber: string;
}

export default function ReservationsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    hotel: '',
    checkInDate: '',
    checkOutDate: '',
    paymentStatus: '',
    guestName: '',
    confirmationNumber: ''
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for demonstration
  useEffect(() => {
    loadBookings();
  }, [currentPage, filters]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual API call
      const mockBookings: Booking[] = [
        {
          id: '1',
          confirmationNumber: 'AMB001234',
          status: 'confirmed',
          checkInDate: '2024-08-20',
          checkOutDate: '2024-08-23',
          numberOfNights: 3,
          adults: 2,
          children: 0,
          totalAmount: 450.00,
          currency: 'USD',
          paymentStatus: 'paid',
          guest: {
            id: 'g1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '+1-555-0123',
            vipStatus: true
          },
          hotel: {
            id: 'h1',
            name: 'Ambassador Jerusalem'
          },
          roomType: {
            id: 'rt1',
            name: 'Deluxe Room'
          },
          room: {
            roomNumber: '401',
            floor: 4
          },
          specialRequests: 'High floor, city view preferred',
          bookingSource: 'website',
          createdAt: '2024-08-15T10:30:00Z',
          tasks: [
            {
              id: 't1',
              type: 'check_in_prep',
              title: 'Prepare VIP amenities',
              priority: 'high',
              status: 'pending',
              dueDate: '2024-08-20T14:00:00Z',
              assignedTo: 'Guest Services'
            }
          ],
          communications: [
            {
              id: 'c1',
              type: 'email',
              direction: 'outbound',
              subject: 'Booking Confirmation',
              content: 'Thank you for your reservation...',
              sentAt: '2024-08-15T10:35:00Z',
              status: 'delivered'
            }
          ]
        },
        {
          id: '2',
          confirmationNumber: 'AMB001235',
          status: 'pending',
          checkInDate: '2024-08-25',
          checkOutDate: '2024-08-27',
          numberOfNights: 2,
          adults: 1,
          children: 1,
          totalAmount: 320.00,
          currency: 'USD',
          paymentStatus: 'pending',
          guest: {
            id: 'g2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.j@email.com',
            phone: '+1-555-0456',
            vipStatus: false
          },
          hotel: {
            id: 'h2',
            name: 'Ambassador Boutique'
          },
          roomType: {
            id: 'rt2',
            name: 'Standard Room'
          },
          specialRequests: 'Crib for infant',
          bookingSource: 'phone',
          createdAt: '2024-08-16T14:22:00Z',
          tasks: [
            {
              id: 't2',
              type: 'confirmation',
              title: 'Confirm payment details',
              priority: 'medium',
              status: 'pending',
              dueDate: '2024-08-17T17:00:00Z',
              assignedTo: 'Reservations'
            }
          ],
          communications: []
        }
      ];

      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setTotalPages(1);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = bookings;

    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }
    if (filters.paymentStatus) {
      filtered = filtered.filter(b => b.paymentStatus === filters.paymentStatus);
    }
    if (filters.guestName) {
      const searchTerm = filters.guestName.toLowerCase();
      filtered = filtered.filter(b => 
        b.guest.firstName.toLowerCase().includes(searchTerm) ||
        b.guest.lastName.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.confirmationNumber) {
      filtered = filtered.filter(b => 
        b.confirmationNumber.toLowerCase().includes(filters.confirmationNumber.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      pending: 'outline',
      confirmed: 'default',
      cancelled: 'destructive',
      no_show: 'destructive',
      completed: 'secondary'
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      pending: 'outline',
      partial: 'outline',
      paid: 'default',
      refunded: 'secondary'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      // This would be replaced with actual API call
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus as any } : b
      ));
      setFilteredBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus as any } : b
      ));
      toast.success('Booking status updated');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      // This would be replaced with actual API call
      setSelectedBooking(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => 
            t.id === taskId ? { ...t, status: 'completed' as const } : t
          )
        };
      });
      toast.success('Task completed');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const sendCommunication = async (type: 'email' | 'sms', content: string) => {
    try {
      // This would be replaced with actual API call
      const newComm: Communication = {
        id: Date.now().toString(),
        type,
        direction: 'outbound',
        content,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      setSelectedBooking(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          communications: [newComm, ...prev.communications]
        };
      });
      toast.success(`${type.toUpperCase()} sent successfully`);
    } catch (error) {
      console.error('Error sending communication:', error);
      toast.error(`Failed to send ${type}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reservations Management</h1>
          <p className="text-muted-foreground">Manage all hotel bookings and guest communications</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Today's Arrivals</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">In House</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending Tasks</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Payment Due</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Bookings</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment">Payment Status</Label>
                <Select value={filters.paymentStatus} onValueChange={(value) => setFilters({...filters, paymentStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="guest">Guest Name</Label>
                <Input
                  id="guest"
                  placeholder="Search guest name"
                  value={filters.guestName}
                  onChange={(e) => setFilters({...filters, guestName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="confirmation">Confirmation #</Label>
                <Input
                  id="confirmation"
                  placeholder="Confirmation number"
                  value={filters.confirmationNumber}
                  onChange={(e) => setFilters({...filters, confirmationNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={applyFilters}>
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Confirmation #</th>
                  <th className="text-left p-4 font-medium">Guest</th>
                  <th className="text-left p-4 font-medium">Hotel</th>
                  <th className="text-left p-4 font-medium">Dates</th>
                  <th className="text-left p-4 font-medium">Room</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8">Loading...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8">No bookings found</td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{booking.confirmationNumber}</span>
                          {booking.guest.vipStatus && (
                            <Badge variant="outline" className="text-xs">VIP</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</p>
                          <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span>{booking.hotel.name}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{booking.numberOfNights} nights</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">{booking.roomType.name}</p>
                          {booking.room && (
                            <p className="text-xs text-muted-foreground">Room {booking.room.roomNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-4">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{booking.currency} {booking.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {booking.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>Booking {selectedBooking.confirmationNumber}</span>
                {selectedBooking.guest.vipStatus && (
                  <Badge variant="outline">VIP</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Manage booking details, tasks, and communications
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({selectedBooking.tasks.filter(t => t.status !== 'completed').length})</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Name:</strong> {selectedBooking.guest.firstName} {selectedBooking.guest.lastName}</p>
                      <p><strong>Email:</strong> {selectedBooking.guest.email}</p>
                      <p><strong>Phone:</strong> {selectedBooking.guest.phone}</p>
                      <p><strong>VIP Status:</strong> {selectedBooking.guest.vipStatus ? 'Yes' : 'No'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Hotel:</strong> {selectedBooking.hotel.name}</p>
                      <p><strong>Room Type:</strong> {selectedBooking.roomType.name}</p>
                      {selectedBooking.room && (
                        <p><strong>Room:</strong> {selectedBooking.room.roomNumber} (Floor {selectedBooking.room.floor})</p>
                      )}
                      <p><strong>Guests:</strong> {selectedBooking.adults} adults, {selectedBooking.children} children</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedBooking.specialRequests && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Special Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedBooking.specialRequests}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="space-y-2">
                  {selectedBooking.tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {task.dueDate && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Due: {new Date(task.dueDate).toLocaleString()}
                              </p>
                            )}
                            {task.assignedTo && (
                              <p className="text-sm text-muted-foreground">
                                Assigned to: {task.assignedTo}
                              </p>
                            )}
                            {task.notes && (
                              <p className="text-sm mt-2">{task.notes}</p>
                            )}
                          </div>
                          {task.status !== 'completed' && (
                            <Button 
                              size="sm" 
                              onClick={() => completeTask(task.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {selectedBooking.tasks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No tasks found</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <div className="flex space-x-2 mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Email</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email-subject">Subject</Label>
                          <Input id="email-subject" placeholder="Email subject" />
                        </div>
                        <div>
                          <Label htmlFor="email-content">Message</Label>
                          <Textarea 
                            id="email-content" 
                            placeholder="Email content" 
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => sendCommunication('email', 'Email content here')}>
                          Send Email
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send SMS
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send SMS</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="sms-content">Message</Label>
                          <Textarea 
                            id="sms-content" 
                            placeholder="SMS content (max 160 characters)" 
                            maxLength={160}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => sendCommunication('sms', 'SMS content here')}>
                          Send SMS
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {selectedBooking.communications.map((comm) => (
                    <Card key={comm.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={comm.direction === 'outbound' ? 'default' : 'secondary'}>
                                {comm.direction === 'outbound' ? 'Sent' : 'Received'}
                              </Badge>
                              <Badge variant="outline">{comm.type.toUpperCase()}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(comm.sentAt).toLocaleString()}
                              </span>
                            </div>
                            {comm.subject && (
                              <h4 className="font-medium mt-1">{comm.subject}</h4>
                            )}
                            <p className="text-sm mt-2">{comm.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {selectedBooking.communications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No communications found</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Room Total:</span>
                        <span>{selectedBooking.currency} {(selectedBooking.totalAmount * 0.8).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes:</span>
                        <span>{selectedBooking.currency} {(selectedBooking.totalAmount * 0.15).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fees:</span>
                        <span>{selectedBooking.currency} {(selectedBooking.totalAmount * 0.05).toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{selectedBooking.currency} {selectedBooking.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedBooking.paymentStatus === 'pending' && (
                        <Button className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payment
                        </Button>
                      )}
                      {selectedBooking.paymentStatus === 'paid' && (
                        <Button variant="outline" className="w-full">
                          Issue Refund
                        </Button>
                      )}
                      <Button variant="outline" className="w-full">
                        View Payment History
                      </Button>
                      <Button variant="outline" className="w-full">
                        Send Payment Reminder
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}