/**
 * src/hooks/useInitializeCategories.js
 * React hook to initialize categories on app load
 */

import { useEffect, useState } from 'react';
import { CategoryService } from '../api/services';
import { updateDocument, addDocument, getCollection } from '../api/firestore';

const DEFAULT_CATEGORIES = [
    {
        name: 'Studio',
        color: '#F26389',
        subcategories: [
            { id: 'sub-kids', name: 'Kids' },
            { id: 'sub-predebut', name: 'Pre-Debut' },
            { id: 'sub-family-portrait', name: 'Family Portrait' },
            { id: 'sub-adults-couples', name: 'Adults & Couples' }
        ]
    },
    {
        name: 'Event',
        color: '#6366F1',
        subcategories: [
            { id: 'sub-party', name: 'Party' },
            { id: 'sub-birthday', name: 'Birthday' },
            { id: 'sub-ceremony', name: 'Ceremony' },
            { id: 'sub-wedding', name: 'Wedding' }
        ]
    }
];

export const useInitializeCategories = () => {
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeCategories = async () => {
            try {
                setIsInitializing(true);
                setError(null);

                // Check if categories exist
                const existingCategories = await CategoryService.getCategories();

                if (existingCategories && existingCategories.length > 0) {
                    console.log('✅ Categories already initialized');
                    setIsInitializing(false);
                    return;
                }

                // Seed default categories
                console.log('🔄 Initializing categories...');
                const createdCategories = [];
                for (const category of DEFAULT_CATEGORIES) {
                    const created = await addDocument('categories', category);
                    createdCategories.push(created);
                    console.log(`✅ Created category: ${category.name}`);
                }

                // Migrate existing services to include categoryColor
                const services = await getCollection('services');
                if (services && services.length > 0) {
                    console.log('🔄 Migrating services...');
                    for (const service of services) {
                        if (!service.categoryColor) {
                            const matchingCategory = createdCategories.find(
                                c => c.name === service.category
                            );

                            if (matchingCategory) {
                                await updateDocument('services', service.id, {
                                    categoryColor: matchingCategory.color
                                });
                            }
                        }
                    }
                    console.log('✅ Service migration complete');
                }

                console.log('✅ Category initialization complete');
                setIsInitializing(false);
            } catch (err) {
                console.error('❌ Error initializing categories:', err);
                setError(err.message);
                setIsInitializing(false);
            }
        };

        initializeCategories();
    }, []);

    return { isInitializing, error };
};
