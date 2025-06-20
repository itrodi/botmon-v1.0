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

const ServiceCard = ({ 
  id, 
  image, 
  title, 
  price, 
  status, 
  payment,
  vname = [],
  onEdit, 
  onToggle, 
  onDelete 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Handle different status formats
  const isActive = status === 'published' || status === 'active';
  const hasVariants = vname && vname.length > 0;

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

  const handleToggle = async (checked) => {
    setIsToggling(true);
    try {
      const newStatus = checked ? 'published' : 'draft';
      await onToggle(id, newStatus);
    } finally {
      setIsToggling(false);
    }
  };

  // Format price display
  const formatPrice = (priceValue) => {
    const numPrice = Number(priceValue || 0);
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'published':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Service Image */}
      <div className="aspect-square rounded-lg overflow-hidden mb-4 border border-gray-100 relative">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-gray-100 flex items-center justify-center ${image ? 'hidden' : 'flex'}`}
        >
          <Calendar className="h-12 w-12 text-gray-300" />
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}>
            {status === 'published' ? 'active' : status}
          </span>
        </div>

        {/* Variants Badge */}
        {hasVariants && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {vname.length} variant{vname.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Payment Badge */}
        {payment !== undefined && (
          <div className="absolute bottom-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              payment ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {payment ? 'Paid' : 'Free'}
            </span>
          </div>
        )}
      </div>

      {/* Service Info */}
      <div className="space-y-3">
        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm leading-tight flex-1 pr-2 line-clamp-2" title={title}>
            {title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={() => onEdit(id)} 
              className="text-gray-400 hover:text-purple-600 p-1 rounded transition-colors"
              title="Edit service"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDeleteClick} 
              className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
              title="Delete service"
              disabled={isDeleting}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg text-gray-900">
            ${formatPrice(price)}
          </span>
        </div>

        {/* Variants Preview */}
        {hasVariants && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">Variants: </span>
            <span className="text-gray-500">
              {vname.slice(0, 2).join(', ')}
              {vname.length > 2 && ` +${vname.length - 2} more`}
            </span>
          </div>
        )}

        {/* Toggle Switch */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <div className="flex items-center gap-2">
            {isToggling && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
            <Switch 
              checked={isActive} 
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="data-[state=checked]:bg-purple-600"
            />
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
              {hasVariants && (
                <span className="block mt-2 font-medium">
                  Warning: This service has {vname.length} variant{vname.length > 1 ? 's' : ''} that will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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