import { MCQ } from "../mcq-exam/mcq.interface"

export interface Exam {
    id: string,
    title: string,
    instructions: string,
    exam_type: string,
    scheduled_at: Date,
    duration_in_minutes: number,
    is_AI_proctored: boolean
    questions: MCQ[] | undefined
}