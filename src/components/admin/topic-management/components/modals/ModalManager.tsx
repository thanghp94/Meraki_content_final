'use client';

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ModalState, ModalActions } from '../../hooks/useModalState';

// Import existing modals
import { QuizGeneratorModal } from '../../../QuizGeneratorModal';
import { ContentGeneratorModal } from '../../../ContentGeneratorModal';
import AdminQuestionDialog from '../../../AdminQuestionDialog';
import ContentViewModal from '@/components/ui/content-view-modal-fixed';
import { ContentQuestionsModal } from '../questions/ContentQuestionsModal';
import { ManualQuestionModal } from '../../../ManualQuestionModal';
import TopicFormModal from '../TopicFormModal';
import ContentFormModal from '../ContentFormModal';

interface ModalManagerProps {
  modalState: ModalState;
  modalActions: ModalActions;
  topicFormData: any;
  setTopicFormData: (data: any) => void;
  contentFormData: any;
  setContentFormData: (data: any) => void;
  handleTopicSubmit: (e: React.FormEvent) => void;
  handleContentSubmit: (e: React.FormEvent) => void;
  resetTopicForm: () => void;
  resetContentForm: () => void;
  fetchContent: () => void;
  onAddQuestion: (contentId: string) => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  modalState,
  modalActions,
  topicFormData,
  setTopicFormData,
  contentFormData,
  setContentFormData,
  handleTopicSubmit,
  handleContentSubmit,
  resetTopicForm,
  resetContentForm,
  fetchContent,
  onAddQuestion,
}) => {
  const { toast } = useToast();

  return (
    <>
      {/* Topic Form Modal */}
      <TopicFormModal
        isOpen={modalState.isTopicDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            modalActions.closeTopicDialog();
            resetTopicForm();
          }
        }}
        editingTopic={modalState.editingTopic}
        topicFormData={topicFormData}
        setTopicFormData={setTopicFormData}
        handleTopicSubmit={handleTopicSubmit}
        resetTopicForm={resetTopicForm}
      />

      {/* Content Form Modal */}
      <ContentFormModal
        isOpen={modalState.isContentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            modalActions.closeContentDialog();
            resetContentForm();
          }
        }}
        editingContent={modalState.editingContent}
        contentFormData={contentFormData}
        setContentFormData={setContentFormData}
        handleContentSubmit={handleContentSubmit}
        resetContentForm={resetContentForm}
      />

      {/* Quiz Generator Modal */}
      {modalState.selectedContentForAI && (
        <QuizGeneratorModal
          isOpen={modalState.isQuizGeneratorOpen}
          onClose={modalActions.closeQuizGenerator}
          contentId={modalState.selectedContentForAI.id}
          contentTitle={modalState.selectedContentForAI.title}
        />
      )}

      {/* Content Generator Modal */}
      {modalState.selectedTopicForAI && (
        <ContentGeneratorModal
          isOpen={modalState.isContentGeneratorOpen}
          onClose={modalActions.closeContentGenerator}
          topicId={modalState.selectedTopicForAI.id}
          topicName={modalState.selectedTopicForAI.name}
          topicSummary={modalState.selectedTopicForAI.summary}
          onContentGenerated={fetchContent}
        />
      )}

      {/* Admin Question Dialog */}
      {modalState.selectedQuestion && (
        <AdminQuestionDialog
          isOpen={!!modalState.selectedQuestion}
          onClose={modalActions.closeQuestionDialog}
          question={modalState.selectedQuestion}
        />
      )}

      {/* Content View Modal */}
      {modalState.selectedContentForView && (
        <ContentViewModal
          isOpen={!!modalState.selectedContentForView}
          onClose={modalActions.closeContentView}
          contentId={modalState.selectedContentForView.id}
          showNavigation={false}
        />
      )}

      {/* Content Questions Modal */}
      {modalState.selectedContentForQuestions && (
        <ContentQuestionsModal
          isOpen={!!modalState.selectedContentForQuestions}
          onClose={modalActions.closeContentQuestions}
          content={modalState.selectedContentForQuestions}
          onAddQuestion={() => {
            onAddQuestion(modalState.selectedContentForQuestions!.id);
            modalActions.closeContentQuestions();
          }}
          onEditQuestion={(question) => {
            modalActions.setEditingQuestion(question);
            modalActions.closeContentQuestions();
          }}
        />
      )}

      {/* Manual Question Modal */}
      {(modalState.selectedContentForManualQuestion || modalState.editingQuestion) && (
        <ManualQuestionModal
          isOpen={!!(modalState.selectedContentForManualQuestion || modalState.editingQuestion)}
          onClose={modalActions.closeManualQuestionDialog}
          contentId={modalState.selectedContentForManualQuestion?.id || modalState.editingQuestion?.contentid}
          contentTitle={modalState.selectedContentForManualQuestion?.title || 'Edit Question'}
          editingQuestion={modalState.editingQuestion}
          onQuestionCreated={() => {
            modalActions.closeManualQuestionDialog();
            toast({
              title: 'Success',
              description: modalState.editingQuestion ? 'Question updated successfully!' : 'Question created successfully!',
            });
          }}
        />
      )}
    </>
  );
};
