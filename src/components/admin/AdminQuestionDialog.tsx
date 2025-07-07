'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentData, ContentType, parseContentData } from "@/types/question";
import ContentRenderer from "../quiz/ContentRenderer";
import React from 'react';

interface AdminQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    noi_dung: string;
    cau_tra_loi_1?: string;
    cau_tra_loi_2?: string;
    cau_tra_loi_3?: string;
    cau_tra_loi_4?: string;
    correct_choice?: string;
    explanation?: string;
  };
}

export default function AdminQuestionDialog({ isOpen, onClose, question }: AdminQuestionDialogProps) {
  const questionContent = (() => {
    try {
      const parsed = parseContentData(question.noi_dung);
      return parsed;
    } catch {
      return { type: 'text' as ContentType, text: question.noi_dung };
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-none py-2">
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1 space-y-4 min-h-0">
          <div className="space-y-2">
            <h3 className="font-medium">Question Content:</h3>
            <div className="p-4 rounded-lg bg-muted w-full overflow-hidden">
              <ContentRenderer
                content={questionContent}
                textClassName="text-lg leading-relaxed"
                imageClassName="max-h-64 object-contain mx-auto max-w-full sm:max-w-md rounded-lg"
                alt="Question content"
              />
            </div>
          </div>

          {(question.cau_tra_loi_1 || question.cau_tra_loi_2 || question.cau_tra_loi_3 || question.cau_tra_loi_4) && (
            <div className="space-y-2">
              <h3 className="font-medium">Answer Choices:</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { text: question.cau_tra_loi_1, label: 'A' },
                  { text: question.cau_tra_loi_2, label: 'B' },
                  { text: question.cau_tra_loi_3, label: 'C' },
                  { text: question.cau_tra_loi_4, label: 'D' }
                ].map((choice, index) => choice.text && (
                  <div
                    key={index}
                    className={`p-3 rounded-lg relative ${
                      question.correct_choice === (index + 1).toString()
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {question.correct_choice === (index + 1).toString() && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-lg text-blue-600 min-w-[24px]">{choice.label})</span>
                      <div className="flex-1 overflow-hidden">
                        <ContentRenderer
                          content={parseContentData(choice.text)}
                          textClassName="text-base"
                          // Adjusted image size for answer choices: max-h-32 (128px) and max-w-[10rem] (160px)
                          imageClassName="max-h-32 object-contain max-w-full sm:max-w-[10rem] rounded-lg"
                          alt={`Choice ${choice.label}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.explanation && (
            <div className="space-y-2">
              <h3 className="font-medium">Explanation:</h3>
            <div className="p-4 rounded-lg bg-muted w-full overflow-hidden">
                <ContentRenderer
                  content={parseContentData(question.explanation)}
                  textClassName="text-sm text-muted-foreground"
                  imageClassName="max-h-48 object-contain mx-auto max-w-full sm:max-w-xs rounded-lg"
                  alt="Explanation"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
