/**
 * scripts/initializeCategories.js
 * Initializes the categories collection with default categories
 * and migrates existing services to include categoryColor
 */

import { 
    getCollection, 
    addDocument, 
    updateDocument,
    getDocument,
    db
} from '../src/api/firestore.js';
import { collection, getDocs } from 'firebase/firestore';

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

export const initializeCategories = async () => {
    try {
        console.log('🔄 Initializing categories collection...');

        // Check if categories exist
        const existingCategories = await getCollection('categories');
        
        if (existingCategories && existingCategories.length > 0) {
            console.log('✅ Categories already exist, skipping initialization');
            return { success: true, message: 'Categories already initialized' };
        }

        // Seed default categories
        console.log('📝 Creating default categories...');
        const createdCategories = [];
        for (const category of DEFAULT_CATEGORIES) {
            const created = await addDocument('categories', category);
            createdCategories.push(created);
            console.log(`✅ Created category: ${category.name}`);
        }

        // Migrate existing services to include categoryColor
        console.log('🔄 Migrating existing services...');
        const services = await getCollection('services');
        
        if (services && services.length > 0) {
            let migratedCount = 0;
            for (const service of services) {
                if (!service.categoryColor) {
                    // Find matching category and get its color
                    const matchingCategory = createdCategories.find(
                        c => c.name === service.category
                    );
                    
                    if (matchingCategory) {
                        await updateDocument('services', service.id, {
                            categoryColor: matchingCategory.color
                        });
                        migratedCount++;
                    }
                }
            }
            console.log(`✅ Migrated ${migratedCount} services with category colors`);
        }

        return {
            success: true,
            message: 'Categories initialized successfully',
            categoriesCreated: createdCategories.length,
            servicesMigrated: services?.length || 0
        };
    } catch (error) {
        console.error('❌ Error initializing categories:', error);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Alternative: Client-side initialization hook
 * Use this in your main app component if you want to initialize on app load
 */
export const useInitializeCategories = () => {
    const [isInitializing, setIsInitializing] = React.useState(false);
    const [error, setError] = React.useState(null);

    const initialize = async () => {
        setIsInitializing(true);
        setError(null);
        try {
            const result = await initializeCategories();
            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsInitializing(false);
        }
    };

    return { initialize, isInitializing, error };
};
