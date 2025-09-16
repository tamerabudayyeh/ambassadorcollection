/**
 * Comprehensive Reservation Department Workflow Management System
 * Handles all reservation operations, staff tasks, and guest communication
 */

import { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface ReservationTask {
  id: string;
  bookingId: string;
  taskType: 'confirmation' | 'modification' | 'cancellation' | 'check_in_prep' | 'special_request' | 'upsell' | 'follow_up';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestCommunication {
  id: string;
  guestId: string;
  bookingId?: string;
  staffUserId?: string;
  type: 'email' | 'sms' | 'call' | 'in_person' | 'whatsapp';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'failed';
  metadata: any;
}

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: {
    event: 'booking_created' | 'booking_modified' | 'check_in_due' | 'cancellation' | 'special_request';
    conditions?: any;
  };
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number;
}

export interface WorkflowAction {
  type: 'create_task' | 'send_email' | 'send_sms' | 'assign_staff' | 'update_status' | 'create_note';
  parameters: any;
  delay?: number; // minutes
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'reservations_agent' | 'reservations_manager' | 'front_desk' | 'guest_services' | 'revenue_manager';
  isActive: boolean;
  workload: number; // current number of active tasks
  skills: string[];
  availableHours: { start: string; end: string; days: number[] };
}

export class ReservationWorkflowManager {
  private supabase: SupabaseClient;
  private workflowRules: WorkflowRule[] = [];
  private staff: Map<string, StaffMember> = new Map();

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.initializeWorkflows();
  }

  /**
   * Initialize default workflow rules
   */
  private async initializeWorkflows(): Promise<void> {
    this.workflowRules = [
      {
        id: 'booking_confirmation',
        name: 'New Booking Confirmation',
        trigger: { event: 'booking_created' },
        actions: [
          {
            type: 'send_email',
            parameters: {
              template: 'booking_confirmation',
              priority: 'high'
            }
          },
          {
            type: 'create_task',
            parameters: {
              taskType: 'confirmation',
              title: 'Verify booking details and send confirmation',
              priority: 'medium',
              dueDate: '+30 minutes'
            }
          }
        ],
        isActive: true,
        priority: 1
      },
      {
        id: 'check_in_preparation',
        name: 'Check-in Preparation',
        trigger: { 
          event: 'check_in_due',
          conditions: { daysBeforeCheckIn: 1 }
        },
        actions: [
          {
            type: 'create_task',
            parameters: {
              taskType: 'check_in_prep',
              title: 'Prepare for guest arrival',
              priority: 'medium',
              dueDate: '+4 hours'
            }
          },
          {
            type: 'send_email',
            parameters: {
              template: 'check_in_reminder',
              priority: 'medium'
            }
          }
        ],
        isActive: true,
        priority: 2
      },
      {
        id: 'vip_guest_workflow',
        name: 'VIP Guest Special Handling',
        trigger: { 
          event: 'booking_created',
          conditions: { guestVipStatus: true }
        },
        actions: [
          {
            type: 'create_task',
            parameters: {
              taskType: 'special_request',
              title: 'Arrange VIP amenities and room upgrade',
              priority: 'high',
              dueDate: '+1 hour'
            }
          },
          {
            type: 'assign_staff',
            parameters: {
              role: 'guest_services',
              skillRequired: 'vip_handling'
            }
          }
        ],
        isActive: true,
        priority: 3
      }
    ];
  }

  /**
   * Process a booking event and trigger workflows
   */
  async processBookingEvent(
    event: 'booking_created' | 'booking_modified' | 'check_in_due' | 'cancellation',
    bookingId: string,
    eventData: any
  ): Promise<void> {
    try {
      // Get booking details
      const { data: booking, error } = await this.supabase
        .from('bookings')
        .select(`
          *,
          guests(*),
          hotels(*),
          room_types(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        throw new Error('Booking not found');
      }

      // Find applicable workflow rules
      const applicableRules = this.workflowRules.filter(rule => 
        rule.isActive && 
        rule.trigger.event === event &&
        this.evaluateConditions(rule.trigger.conditions, booking, eventData)
      );

      // Execute workflows in priority order
      for (const rule of applicableRules.sort((a, b) => a.priority - b.priority)) {
        await this.executeWorkflow(rule, booking, eventData);
      }
    } catch (error) {
      console.error('Workflow processing error:', error);
      throw error;
    }
  }

  /**
   * Execute a workflow rule
   */
  private async executeWorkflow(
    rule: WorkflowRule,
    booking: any,
    eventData: any
  ): Promise<void> {
    try {
      for (const action of rule.actions) {
        // Apply delay if specified
        if (action.delay) {
          setTimeout(async () => {
            await this.executeAction(action, booking, eventData);
          }, action.delay * 60 * 1000);
        } else {
          await this.executeAction(action, booking, eventData);
        }
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
    }
  }

  /**
   * Execute a specific workflow action
   */
  private async executeAction(
    action: WorkflowAction,
    booking: any,
    eventData: any
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'create_task':
          await this.createTask({
            bookingId: booking.id,
            taskType: action.parameters.taskType,
            title: action.parameters.title,
            description: action.parameters.description || '',
            priority: action.parameters.priority || 'medium',
            dueDate: this.parseDueDate(action.parameters.dueDate),
            metadata: { workflowGenerated: true, rule: action.parameters }
          });
          break;

        case 'send_email':
          await this.sendEmail(
            booking.guests.email,
            action.parameters.template,
            {
              booking,
              guest: booking.guests,
              hotel: booking.hotels
            }
          );
          break;

        case 'send_sms':
          await this.sendSMS(
            booking.guests.phone,
            action.parameters.template,
            {
              booking,
              guest: booking.guests,
              hotel: booking.hotels
            }
          );
          break;

        case 'assign_staff':
          const staffMember = await this.assignOptimalStaff(
            action.parameters.role,
            action.parameters.skillRequired,
            booking.hotel_id
          );
          if (staffMember) {
            // Update any pending tasks for this booking to assign the staff member
            await this.supabase
              .from('booking_tasks')
              .update({ assigned_to: staffMember.id })
              .eq('booking_id', booking.id)
              .eq('status', 'pending');
          }
          break;
      }
    } catch (error) {
      console.error('Action execution error:', error);
    }
  }

  /**
   * Create a new reservation task
   */
  async createTask(task: Partial<ReservationTask>): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('booking_tasks')
        .insert({
          booking_id: task.bookingId!,
          task_type: task.taskType!,
          title: task.title!,
          description: task.description || '',
          priority: task.priority || 'medium',
          status: 'pending',
          due_date: task.dueDate?.toISOString(),
          metadata: task.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }

      // Auto-assign if no specific assignment
      if (!task.assignedTo) {
        await this.autoAssignTask(data.id, task.taskType!);
      }

      return data.id;
    } catch (error) {
      console.error('Task creation error:', error);
      throw error;
    }
  }

  /**
   * Assign a task to the optimal staff member
   */
  async autoAssignTask(taskId: string, taskType: string): Promise<void> {
    try {
      const requiredSkills = this.getRequiredSkills(taskType);
      const staffMember = await this.findOptimalStaff(requiredSkills);

      if (staffMember) {
        await this.supabase
          .from('booking_tasks')
          .update({ 
            assigned_to: staffMember.id,
            status: 'in_progress' 
          })
          .eq('id', taskId);

        // Update staff workload
        this.staff.set(staffMember.id, {
          ...staffMember,
          workload: staffMember.workload + 1
        });
      }
    } catch (error) {
      console.error('Task assignment error:', error);
    }
  }

  /**
   * Complete a task
   */
  async completeTask(
    taskId: string,
    completedBy: string,
    notes?: string,
    results?: any
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('booking_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy,
          notes: notes || null,
          metadata: results || {}
        })
        .eq('id', taskId);

      if (error) {
        throw new Error(`Failed to complete task: ${error.message}`);
      }

      // Update staff workload
      const { data: task } = await this.supabase
        .from('booking_tasks')
        .select('assigned_to')
        .eq('id', taskId)
        .single();

      if (task?.assigned_to) {
        const staffMember = this.staff.get(task.assigned_to);
        if (staffMember) {
          this.staff.set(staffMember.id, {
            ...staffMember,
            workload: Math.max(0, staffMember.workload - 1)
          });
        }
      }
    } catch (error) {
      console.error('Task completion error:', error);
      throw error;
    }
  }

  /**
   * Get tasks for a staff member
   */
  async getStaffTasks(
    staffId: string,
    status?: 'pending' | 'in_progress' | 'completed'
  ): Promise<ReservationTask[]> {
    try {
      let query = this.supabase
        .from('booking_tasks')
        .select(`
          *,
          bookings!inner(
            confirmation_number,
            check_in_date,
            check_out_date,
            guests(first_name, last_name, email),
            hotels(name)
          )
        `)
        .eq('assigned_to', staffId)
        .order('due_date', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get staff tasks: ${error.message}`);
      }

      return data?.map(task => ({
        id: task.id,
        bookingId: task.booking_id,
        taskType: task.task_type as any,
        title: task.title,
        description: task.description,
        priority: task.priority as any,
        status: task.status as any,
        assignedTo: task.assigned_to,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        completedBy: task.completed_by,
        notes: task.notes,
        metadata: task.metadata,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      })) || [];
    } catch (error) {
      console.error('Staff tasks retrieval error:', error);
      throw error;
    }
  }

  /**
   * Send email communication
   */
  async sendEmail(
    to: string,
    template: string,
    data: any,
    bookingId?: string
  ): Promise<string> {
    try {
      const emailContent = await this.renderEmailTemplate(template, data);

      // Record communication
      const { data: communication, error } = await this.supabase
        .from('guest_communications')
        .insert({
          guest_id: data.guest.id,
          booking_id: bookingId,
          communication_type: 'email',
          direction: 'outbound',
          subject: emailContent.subject,
          content: emailContent.body,
          status: 'sent',
          metadata: {
            template,
            to,
            emailProvider: 'system'
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record email communication: ${error.message}`);
      }

      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      console.log('Email sent:', {
        to,
        subject: emailContent.subject,
        template
      });

      return communication.id;
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  /**
   * Send SMS communication
   */
  async sendSMS(
    to: string,
    template: string,
    data: any,
    bookingId?: string
  ): Promise<string> {
    try {
      const smsContent = await this.renderSMSTemplate(template, data);

      // Record communication
      const { data: communication, error } = await this.supabase
        .from('guest_communications')
        .insert({
          guest_id: data.guest.id,
          booking_id: bookingId,
          communication_type: 'sms',
          direction: 'outbound',
          content: smsContent,
          status: 'sent',
          metadata: {
            template,
            to,
            smsProvider: 'system'
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record SMS communication: ${error.message}`);
      }

      // TODO: Integrate with actual SMS service (Twilio, etc.)
      console.log('SMS sent:', {
        to,
        content: smsContent,
        template
      });

      return communication.id;
    } catch (error) {
      console.error('SMS sending error:', error);
      throw error;
    }
  }

  /**
   * Get guest communication history
   */
  async getGuestCommunications(
    guestId: string,
    bookingId?: string
  ): Promise<GuestCommunication[]> {
    try {
      let query = this.supabase
        .from('guest_communications')
        .select('*')
        .eq('guest_id', guestId)
        .order('sent_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get communications: ${error.message}`);
      }

      return data?.map(comm => ({
        id: comm.id,
        guestId: comm.guest_id,
        bookingId: comm.booking_id,
        staffUserId: comm.staff_user_id,
        type: comm.communication_type as any,
        direction: comm.direction as any,
        subject: comm.subject,
        content: comm.content,
        sentAt: new Date(comm.sent_at),
        openedAt: comm.opened_at ? new Date(comm.opened_at) : undefined,
        clickedAt: comm.clicked_at ? new Date(comm.clicked_at) : undefined,
        repliedAt: comm.replied_at ? new Date(comm.replied_at) : undefined,
        status: comm.status,
        metadata: comm.metadata
      })) || [];
    } catch (error) {
      console.error('Communication history error:', error);
      throw error;
    }
  }

  /**
   * Get booking tasks
   */
  async getBookingTasks(bookingId: string): Promise<ReservationTask[]> {
    try {
      const { data, error } = await this.supabase
        .from('booking_tasks')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get booking tasks: ${error.message}`);
      }

      return data?.map(task => ({
        id: task.id,
        bookingId: task.booking_id,
        taskType: task.task_type as any,
        title: task.title,
        description: task.description,
        priority: task.priority as any,
        status: task.status as any,
        assignedTo: task.assigned_to,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        completedBy: task.completed_by,
        notes: task.notes,
        metadata: task.metadata,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      })) || [];
    } catch (error) {
      console.error('Booking tasks error:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private evaluateConditions(conditions: any, booking: any, eventData: any): boolean {
    if (!conditions) return true;

    // Example condition evaluation
    if (conditions.guestVipStatus !== undefined) {
      return booking.guests.vip_status === conditions.guestVipStatus;
    }

    if (conditions.daysBeforeCheckIn !== undefined) {
      const checkInDate = new Date(booking.check_in_date);
      const today = new Date();
      const daysDiff = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff === conditions.daysBeforeCheckIn;
    }

    return true;
  }

  private parseDueDate(dueDateString?: string): Date | undefined {
    if (!dueDateString) return undefined;

    if (dueDateString.startsWith('+')) {
      const match = dueDateString.match(/\+(\d+)\s*(minutes?|hours?|days?)/);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        const now = new Date();

        switch (unit) {
          case 'minute':
          case 'minutes':
            return new Date(now.getTime() + amount * 60 * 1000);
          case 'hour':
          case 'hours':
            return new Date(now.getTime() + amount * 60 * 60 * 1000);
          case 'day':
          case 'days':
            return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
        }
      }
    }

    return new Date(dueDateString);
  }

  private getRequiredSkills(taskType: string): string[] {
    const skillMap: { [key: string]: string[] } = {
      'confirmation': ['booking_management'],
      'modification': ['booking_management', 'customer_service'],
      'cancellation': ['booking_management', 'customer_service'],
      'check_in_prep': ['front_desk', 'guest_services'],
      'special_request': ['guest_services', 'concierge'],
      'upsell': ['sales', 'customer_service'],
      'follow_up': ['customer_service']
    };

    return skillMap[taskType] || [];
  }

  private async findOptimalStaff(requiredSkills: string[]): Promise<StaffMember | null> {
    // Simple algorithm - find staff with matching skills and lowest workload
    const availableStaff = Array.from(this.staff.values()).filter(staff => 
      staff.isActive && 
      requiredSkills.some(skill => staff.skills.includes(skill))
    );

    if (availableStaff.length === 0) return null;

    return availableStaff.sort((a, b) => a.workload - b.workload)[0];
  }

  private async assignOptimalStaff(
    role: string,
    skillRequired?: string,
    hotelId?: string
  ): Promise<StaffMember | null> {
    // Find staff by role and skill
    const staff = Array.from(this.staff.values()).filter(s => 
      s.role === role && 
      s.isActive &&
      (!skillRequired || s.skills.includes(skillRequired))
    );

    if (staff.length === 0) return null;

    // Return staff member with lowest workload
    return staff.sort((a, b) => a.workload - b.workload)[0];
  }

  private async renderEmailTemplate(template: string, data: any): Promise<{ subject: string; body: string }> {
    // Template rendering logic
    const templates: { [key: string]: { subject: string; body: string } } = {
      'booking_confirmation': {
        subject: `Booking Confirmation - ${data.booking.confirmation_number}`,
        body: `Dear ${data.guest.first_name},\n\nYour booking has been confirmed...\n\nBest regards,\n${data.hotel.name}`
      },
      'check_in_reminder': {
        subject: `Check-in Reminder - ${data.hotel.name}`,
        body: `Dear ${data.guest.first_name},\n\nWe look forward to welcoming you tomorrow...\n\nBest regards,\n${data.hotel.name}`
      }
    };

    return templates[template] || {
      subject: 'Hotel Communication',
      body: 'Thank you for choosing our hotel.'
    };
  }

  private async renderSMSTemplate(template: string, data: any): Promise<string> {
    const templates: { [key: string]: string } = {
      'check_in_reminder': `Hi ${data.guest.first_name}! Looking forward to welcoming you tomorrow at ${data.hotel.name}. Check-in starts at 3 PM.`,
      'booking_confirmation': `Booking confirmed! Ref: ${data.booking.confirmation_number}. Check-in: ${data.booking.check_in_date}. ${data.hotel.name}`
    };

    return templates[template] || 'Thank you for choosing our hotel.';
  }
}