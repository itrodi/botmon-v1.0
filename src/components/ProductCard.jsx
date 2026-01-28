import React, { useState } from 'react';
import { Edit2, Trash, Loader, FileText } from 'lucide-react';
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

const ProductCard = ({ 
  id, 
  image, 
  title, 
  price, 
  quantity, 
  status, 
  vname = [], 
  isDraft = false,
  itemType = 'product',
  onEdit, 
  onToggle, 
  onDelete 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Handle different status formats - normalize to boolean
  const isActive = status === 'true' || status === true || status === 'active';
  const hasVariants = vname && vname.length > 0;

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggle = async (checked) => {
    setIsToggling(true);
    try {
      // Send as 'true' or 'false' string to match backend expectation
      const newStatus = checked ? 'true' : 'false';
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
    if (isDraft) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (isActive) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  // Get display status text
  const getStatusText = () => {
    if (isDraft) {
      return 'draft';
    }
    return isActive ? 'active' : 'inactive';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Product Image */}
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
          <span className="text-gray-400 text-sm">No image</span>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}>
            {isDraft && <FileText className="w-3 h-3 inline mr-1" />}
            {getStatusText()}
          </span>
        </div>

        {/* Item Type Badge (for drafts) */}
        {isDraft && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
              {itemType}
            </span>
          </div>
        )}

        {/* Variants Badge */}
        {hasVariants && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {vname.length} variant{vname.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
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
              title="Edit product"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDeleteClick} 
              className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
              title="Delete product"
              disabled={isDeleting}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg text-gray-900">
            ₦{formatPrice(price)}
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            QTY: {quantity || 0}
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
            {isDraft ? 'Publish' : isActive ? 'Active' : 'Inactive'}
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
        
        {/* Draft hint */}
        {isDraft && (
          <p className="text-xs text-yellow-600 text-center">
            Toggle to publish this draft
          </p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {isDraft ? 'draft ' : ''}product "{title}". This action cannot be undone.
              {hasVariants && (
                <span className="block mt-2 font-medium">
                  Warning: This product has {vname.length} variant{vname.length > 1 ? 's' : ''} that will also be deleted.
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

export default ProductCard;