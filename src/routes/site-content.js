const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const database = require('../database/database');

// Path to store site content
const siteContentPath = path.join(__dirname, '../../data/site-content.json');
const defaultSiteContentPath = path.join(__dirname, '../../data/default-site-content.json');

// Default site content structure
const defaultSiteContent = {
  header: {
    title: "RAO FAMILY DYNASTY",
    subtitle: "Established 1895 • Honoring Our Heritage",
    layout: "default" // Added layout option
  },
  footer: {
    copyright: "© 2025 Rao Family. All Rights Reserved.",
    tagline: "Preserving our legacy for future generations",
    links: [
      { text: "Admin Login", url: "/admin" },
      { text: "Privacy Policy", url: "#" },
      { text: "Terms of Use", url: "#" }
    ]
  },
  history: {
    title: "Family History",
    introduction: "The Rao family traces its lineage back to the late 19th century, with Nana / Nanha establishing the family dynasty in 1895. Through generations, the family has maintained its traditions while adapting to modern times.",
    achievements: [
      "Establishment of the family business empire in the early 20th century",
      "Philanthropic contributions to education and healthcare",
      "Preservation of family heritage and traditions across generations",
      "Expansion of family influence across regions"
    ],
    values: "The Rao family is built on principles of integrity, respect for elders, commitment to education, and dedication to community service. These values have been passed down through generations, forming the foundation of the family's enduring legacy.",
    motto: "Honor the past, serve the present, build the future.",
    crestSymbolism: "The crown represents leadership and nobility, while the golden background symbolizes prosperity and the enduring legacy of the family."
  },
  timeline: {
    title: "Family Timeline",
    events: [
      { year: "1895", description: "Nana / Nanha establishes the Rao family dynasty, laying the foundation for future generations." },
      { year: "1910", description: "Kabeer (Kabeera) expands family influence in the region and strengthens business connections." },
      { year: "1940", description: "Mubarak becomes known for philanthropic work and community leadership during challenging times." },
      { year: "1970", description: "Ashraf Rao modernizes family business ventures while preserving traditional values." },
      { year: "2000", description: "Muhammad Bin Ashraf Rao becomes head of family enterprises, focusing on global expansion." },
      { year: "2023", description: "Khizar Bin Muhammad Rao emerges as the next generation leader with interests in technology and sustainability." }
    ]
  },
  stats: {
    years_legacy: "127"
  },
  customContent: {
    // For storing custom paragraphs/lines
    sections: []
  }
};

// Helper function to read site content
async function readSiteContent() {
  try {
    const data = await fs.readFile(siteContentPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with default content
    if (error.code === 'ENOENT') {
      await writeSiteContent(defaultSiteContent);
      return defaultSiteContent;
    }
    throw error;
  }
}

// Helper function to write site content
async function writeSiteContent(content) {
  await fs.writeFile(siteContentPath, JSON.stringify(content, null, 2));
}

// Helper function to set current content as default
async function setCurrentAsDefault() {
  try {
    const currentContent = await readSiteContent();
    await fs.writeFile(defaultSiteContentPath, JSON.stringify(currentContent, null, 2));
    return true;
  } catch (error) {
    console.error('Error setting current content as default:', error);
    throw error;
  }
}

// GET /api/site-content - Get current site content
router.get('/', async (req, res) => {
  try {
    const siteContent = await readSiteContent();
    res.json({ 
      success: true, 
      data: siteContent 
    });
  } catch (error) {
    console.error('Error reading site content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load site content' 
    });
  }
});

// POST /api/site-content - Update site content
router.post('/', async (req, res) => {
  try {
    const newContent = req.body;
    
    // Validate required structure
    if (!newContent.header || !newContent.footer || !newContent.history || !newContent.timeline) {
      return res.status(400).json({
        success: false,
        error: 'Invalid site content structure'
      });
    }

    await writeSiteContent(newContent);
    
    res.json({ 
      success: true, 
      message: 'Site content updated successfully',
      data: newContent
    });
  } catch (error) {
    console.error('Error writing site content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update site content' 
    });
  }
});

// POST /api/site-content/set-default - Set current content as default
router.post('/set-default', async (req, res) => {
  try {
    await setCurrentAsDefault();
    
    res.json({ 
      success: true, 
      message: 'Current content set as default successfully'
    });
  } catch (error) {
    console.error('Error setting content as default:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to set current content as default' 
    });
  }
});

// POST /api/site-content/reset-to-default - Reset to default content
router.post('/reset-to-default', async (req, res) => {
  try {
    await writeSiteContent(defaultSiteContent);
    
    res.json({ 
      success: true, 
      message: 'Site content reset to default successfully',
      data: defaultSiteContent
    });
  } catch (error) {
    console.error('Error resetting to default content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset to default content' 
    });
  }
});

// POST /api/site-content/custom - Add custom content
router.post('/custom', async (req, res) => {
  try {
    const { section, content, type = 'paragraph' } = req.body;
    
    if (!section || !content) {
      return res.status(400).json({
        success: false,
        error: 'Section and content are required'
      });
    }

    const siteContent = await readSiteContent();
    
    if (!siteContent.customContent) {
      siteContent.customContent = { sections: [] };
    }

    // Add or update custom content
    const existingIndex = siteContent.customContent.sections.findIndex(s => s.section === section);
    if (existingIndex >= 0) {
      siteContent.customContent.sections[existingIndex] = { section, content, type };
    } else {
      siteContent.customContent.sections.push({ section, content, type });
    }

    await writeSiteContent(siteContent);
    
    res.json({ 
      success: true, 
      message: 'Custom content added successfully',
      data: siteContent.customContent
    });
  } catch (error) {
    console.error('Error adding custom content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add custom content' 
    });
  }
});

module.exports = router;