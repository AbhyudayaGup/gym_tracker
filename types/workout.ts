import { z } from "zod";

export const machineSpecSchema = z.object({
  machineName: z.string().min(1),
  seatHeight: z.string().optional().default(""),
  angle: z.string().optional().default(""),
  loadUnit: z.enum(["kg", "lb", "plates"]).default("kg"),
  notes: z.string().optional().default(""),
});

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  machine: machineSpecSchema,
  createdAt: z.string(),
});

export const setEntrySchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().nonnegative().optional(),
});

export const workoutEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  exerciseId: z.string(),
  sets: z.array(setEntrySchema).min(1),
  createdAt: z.string(),
});

export const workoutSnapshotSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  deviceId: z.string(),
  exercises: z.array(exerciseSchema),
  logs: z.array(workoutEntrySchema),
});

export type MachineSpec = z.infer<typeof machineSpecSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type SetEntry = z.infer<typeof setEntrySchema>;
export type WorkoutEntry = z.infer<typeof workoutEntrySchema>;
export type WorkoutSnapshot = z.infer<typeof workoutSnapshotSchema>;

export const createEmptySnapshot = (deviceId: string): WorkoutSnapshot => ({
  version: 1,
  updatedAt: new Date(0).toISOString(),
  deviceId,
  exercises: [],
  logs: [],
});
