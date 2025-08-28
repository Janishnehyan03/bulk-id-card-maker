import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CardTemplate } from '../types';

// Extend CardTemplate to include database fields
export interface SavedTemplate extends CardTemplate {
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic?: boolean;
  description?: string;
}

// Create template collections reference
const templatesRef = collection(db, 'templates');

export const templateService = {
  // Save a new template
  async saveTemplate(template: CardTemplate, userId: string, description?: string): Promise<string> {
    try {
      const templateData: Omit<SavedTemplate, 'id'> = {
        ...template,
        userId,
        description: description || '',
        isPublic: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(templatesRef, templateData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving template:', error);
      throw new Error('Failed to save template');
    }
  },

  // Update an existing template
  async updateTemplate(templateId: string, updates: Partial<CardTemplate & { description?: string }>, userId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      
      // First, verify the user owns this template
      const templateDoc = await getDoc(templateRef);
      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }
      
      const templateData = templateDoc.data() as SavedTemplate;
      if (templateData.userId !== userId) {
        throw new Error('Unauthorized to update this template');
      }

      await updateDoc(templateRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  },

  // Delete a template
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      
      // First, verify the user owns this template
      const templateDoc = await getDoc(templateRef);
      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }
      
      const templateData = templateDoc.data() as SavedTemplate;
      if (templateData.userId !== userId) {
        throw new Error('Unauthorized to delete this template');
      }

      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  },

  // Get user's templates
  async getUserTemplates(userId: string): Promise<SavedTemplate[]> {
    try {
      const q = query(
        templatesRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: SavedTemplate[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          ...data
        } as SavedTemplate);
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting user templates:', error);
      throw new Error('Failed to load templates');
    }
  },

  // Get a specific template
  async getTemplate(templateId: string): Promise<SavedTemplate | null> {
    try {
      const templateRef = doc(db, 'templates', templateId);
      const templateDoc = await getDoc(templateRef);
      
      if (!templateDoc.exists()) {
        return null;
      }
      
      const data = templateDoc.data();
      return {
        id: templateDoc.id,
        ...data
      } as SavedTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      throw new Error('Failed to load template');
    }
  },

  // Get public templates (for sharing/community)
  async getPublicTemplates(): Promise<SavedTemplate[]> {
    try {
      const q = query(
        templatesRef,
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templates: SavedTemplate[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          ...data
        } as SavedTemplate);
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting public templates:', error);
      throw new Error('Failed to load public templates');
    }
  }
};