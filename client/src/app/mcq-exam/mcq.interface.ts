export interface MCQ {
    id: string | undefined,
    question: string,
    options: { id: string | undefined, option: string, is_correct: boolean }[]
}