export interface Exam {
    id: string,
    title: string,
    exam_type: string,
    scheduled_at: Date,
    duration: number,
    is_AI_proctored: boolean
}