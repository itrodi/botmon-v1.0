import React, { useState } from 'react';
import { Edit2, Trash, Loader, Calendar } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ServiceCard = ({ id, image, title, price, isEnabled, onEdit, onToggle, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="aspect-square rounded-lg overflow-hidden mb-4 border border-gray-100">
        {image ? (
          <img src={`data:image/jpeg;base64,${image}`} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{title}</h3>
          <div className="flex items-center">
            <button onClick={onEdit} className="text-purple-400 hover:text-purple-600 mr-2">
              <span className="flex items-center gap-1 text-sm">
                Edit <Edit2 className="w-4 h-4" />
              </span>
            </button>
            <button onClick={handleDeleteClick} className="text-red-400 hover:text-red-600">
              <span className="flex items-center gap-1 text-sm">
                <Trash className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">${Number(price).toLocaleString()}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Active</span>
            <Switch checked={isEnabled} onCheckedChange={onToggle} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service "{title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceCard;