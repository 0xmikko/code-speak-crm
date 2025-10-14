'use client';

import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { Asset, KanbanColumn, AssetStage } from '../types';
import { STAGES, STAGE_LABELS } from '../types';
import { AssetCard } from './asset-card';
import { CreateAssetModal } from './create-asset-modal';

interface KanbanBoardProps {
  assets: Asset[];
  onStageChange: (assetId: string, newStage: AssetStage) => Promise<boolean>;
  onAssetClick: (asset: Asset) => void;
  onCreateAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'currentStage'>) => Promise<boolean>;
}

export function KanbanBoard({ assets, onStageChange, onAssetClick, onCreateAsset }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Organize assets into columns by stage
  useEffect(() => {
    const columnsData: KanbanColumn[] = STAGES.map((stage) => ({
      id: stage,
      title: STAGE_LABELS[stage],
      cards: assets
        .filter((asset) => asset.currentStage === stage)
        .map((asset) => ({
          id: asset.id,
          content: asset,
        })),
    }));
    setColumns(columnsData);
  }, [assets]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination or dropped in same position
    if (!destination ||
        (destination.droppableId === source.droppableId &&
         destination.index === source.index)) {
      return;
    }

    const assetId = draggableId;
    const newStage = destination.droppableId as AssetStage;

    // Optimistically update UI
    setColumns((prev) => {
      const newColumns = [...prev];
      const sourceColumn = newColumns.find(col => col.id === source.droppableId as AssetStage);
      const destColumn = newColumns.find(col => col.id === newStage);

      if (sourceColumn && destColumn) {
        // Remove from source
        const [movedCard] = sourceColumn.cards.splice(source.index, 1);

        // Add to destination
        destColumn.cards.splice(destination.index, 0, {
          ...movedCard,
          content: { ...movedCard.content, currentStage: newStage },
        });
      }

      return newColumns;
    });

    // Try to update on server
    const success = await onStageChange(assetId, newStage);

    if (!success) {
      // Revert on failure
      setColumns((prev) => {
        const columnsData: KanbanColumn[] = STAGES.map((stage) => ({
          id: stage,
          title: STAGE_LABELS[stage],
          cards: assets
            .filter((asset) => asset.currentStage === stage)
            .map((asset) => ({
              id: asset.id,
              content: asset,
            })),
        }));
        return columnsData;
      });
    }
  }, [assets, onStageChange]);

  const handleCreateAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'currentStage'>) => {
    const success = await onCreateAsset(assetData);
    if (success) {
      setIsCreateModalOpen(false);
    }
    return success;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Create Asset
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full min-w-max space-x-6 p-6">
            {columns.map((column) => (
              <div key={column.id} className="flex w-80 flex-col rounded-lg bg-gray-50">
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900">{column.title}</h3>
                  <span className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                    {column.cards.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 space-y-3 px-4 pb-4 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}`}
                            >
                              <AssetCard
                                asset={card.content}
                                onClick={() => onAssetClick(card.content)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Asset Modal */}
      <CreateAssetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAsset}
      />
    </div>
  );
}