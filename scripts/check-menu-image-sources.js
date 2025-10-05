const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkMenuImageSources() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'maraksh');
    
    console.log('🔍 Checking menu item image sources...\n');
    
    const menuItems = await db.collection('menuitems').find({}).toArray();
    console.log(`Total menu items: ${menuItems.length}`);
    
    // Categorize image sources
    const imageSources = {
      gridfs: 0,
      public: 0,
      none: 0,
      samples: []
    };
    
    menuItems.forEach(item => {
      if (!item.image) {
        imageSources.none++;
      } else if (item.image.startsWith('/api/images/')) {
        imageSources.gridfs++;
        if (imageSources.samples.length < 5) {
          imageSources.samples.push({ name: item.name, image: item.image, type: 'GridFS' });
        }
      } else if (item.image.startsWith('/')) {
        imageSources.public++;
        if (imageSources.samples.length < 5) {
          imageSources.samples.push({ name: item.name, image: item.image, type: 'Public' });
        }
      }
    });
    
    console.log('📊 Image source breakdown:');
    console.log(`   GridFS images: ${imageSources.gridfs}`);
    console.log(`   Public folder images: ${imageSources.public}`);
    console.log(`   No images: ${imageSources.none}`);
    
    console.log('\n📁 Sample image sources:');
    imageSources.samples.forEach(sample => {
      console.log(`   ${sample.name}: ${sample.image} (${sample.type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkMenuImageSources();



