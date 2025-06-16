import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PropertyForm as PropertyFormComponent } from "@/components/host/PropertyForm";
import { useProperty } from "@/hooks/useProperties";
import type { PropertyFormData } from "@/types/Property";
import { propertiesAPI } from "@/utils/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";

export const PropertyFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { property, loading: propertyLoading } = useProperty(id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      setSubmitting(true);
      
      if (isEditing && id) {
        // Update existing property
        await propertiesAPI.update(id, data);
        alert('Property updated successfully!');
      } else {
        // Create new property
        await propertiesAPI.create(data);
        alert('Property created successfully!');
      }
      
      navigate('/host/dashboard?tab=properties');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/host/dashboard?tab=properties');
  };

  if (isEditing && propertyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Property not found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The property you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <Button onClick={() => navigate('/host/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PropertyFormComponent
      property={isEditing ? property || undefined : undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={submitting}
    />
  );
};