import type { Request, Response, NextFunction } from 'express';
import { getOrganizerDashboard } from './services/dashboard.service.js';

import {
  getOrganizerEvents,
  getOrganizerEventById,
  createOrganizerEventWithTickets,
  updateOrganizerEvent,
  deleteOrganizerEvent,
  cancelOrganizerEvent,
  getAllEventVenues,
  createEventVenue,
} from './services/events.service.js';
import { getEventAttendees } from './services/attendees.service.js';

import {
  type UpdateOrganizerEventType,
  type CreateEventWithTicketsType,
  type AssignStaffType,
  createVenueSchema,
  assignStaffSchema,
} from './organizer.schema.js';
import {
  getEventStaff,
  getOrganizerStaff,
  generateStaffInviteLink,
  assignStaffToEvent,
} from './services/staff.service.js';
import logger from '@/utils/logger/index.js';

/**
 * GET /organizer/dashboard
 */
export async function dashboard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;

    const result = await getOrganizerDashboard(organizerId);

    res.status(200).json({
      success: true,

      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /organizer/events
 */
export async function organizerEvents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user.id;
    const isStaff = req.user.role === 'event_staff';
    const organizerId = isStaff ? 0 : userId;

    const { page, pageSize, search, status } = req.query;

    const result = await getOrganizerEvents({
      organizerId,
      ...(isStaff ? { staffUserId: userId } : {}),
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search as string,
      status: status as any,
    });

    res.status(200).json({
      success: true,

      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /organizer/events/:id
 */
export async function organizerEventById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;

    const eventId = Number(req.params.id);

    const result = await getOrganizerEventById(organizerId, eventId);

    res.status(200).json({
      success: true,

      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /organizer/events/with-tickets
 */
export async function createEventWithTickets(
  req: Request<{}, {}, CreateEventWithTicketsType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;

    const result = await createOrganizerEventWithTickets(
      organizerId,
      req.body as any,
    );

    res.status(201).json({
      success: true,
      message: 'Event and tickets created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /organizer/events/:id
 */
export async function updateEvent(
  req: Request<{ id: string }, {}, UpdateOrganizerEventType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;

    const eventId = Number(req.params.id);

    const result = await updateOrganizerEvent(
      organizerId,

      eventId,

      req.body,
    );

    res.status(200).json({
      success: true,

      message: 'Event updated successfully',

      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /organizer/events/:id
 */
export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;

    const eventId = Number(req.params.id);

    const result = await deleteOrganizerEvent(organizerId, eventId);

    res.status(200).json({
      success: true,

      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /organizer/events/:eventId/attendees
 */
export async function eventAttendees(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.eventId);
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const result = await getEventAttendees({ eventId, page, pageSize });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /organizer/events/:id/cancel
 */
export async function cancelEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;

    const eventId = Number(req.params.id);

    const result = await cancelOrganizerEvent(organizerId, eventId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /organizer/event-venues/
 */

export async function getAllVenues(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getAllEventVenues();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /organizer/event-venues
 */
export async function createVenue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createVenueSchema.parse(req.body);
    const result = await createEventVenue(parsed as any);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /organizer/events/:eventId/staff
 */
export async function listEventStaff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.eventId);
    const result = await getEventStaff(eventId);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /organizer/events/:eventId/staff/invite
 */
export async function createStaffInvite(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.eventId);
    const organizerId = req.user.id;
    const result = await generateStaffInviteLink(eventId, organizerId);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /organizer/staff
 */
export async function listOrganizerStaff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = req.user.id;
    const result = await getOrganizerStaff(organizerId);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /organizer/events/:eventId/staff/assign
 */
export async function assignEventStaff(
  req: Request<{ eventId: string }, {}, AssignStaffType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.eventId);
    const organizerId = req.user.id;

    const staffUserIds = req.body.staffUserIds;
    const result = await assignStaffToEvent(eventId, staffUserIds, organizerId);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
