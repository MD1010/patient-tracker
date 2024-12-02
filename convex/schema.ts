import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  patients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    dateOfBirth: v.string(),
    medicalInfo: v.optional(v.string()),
    createdAt: v.string(),
  }).index('by_email', ['email']),
  treatments: defineTable({
    patientId: v.id('patients'),
    type: v.string(),
    description: v.string(),
    date: v.string(),
    cost: v.number(),
    nextAppointment: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
  }).index('by_patient', ['patientId']),
});