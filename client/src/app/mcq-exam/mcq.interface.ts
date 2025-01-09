export interface MCQ {
    id: string | undefined,
    question: string,
    options: { id: string, option: string, is_correct: boolean }[],
}