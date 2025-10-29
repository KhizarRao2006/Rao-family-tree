const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Path to store site content
const siteContentPath = path.join(__dirname, '../../data/site-content.json');

// Default site content structure
const defaultSiteContent = {
  header: {
    title: "RAO FAMILY DYNASTY",
    subtitle: "Established 1895 • Honoring Our Heritage"
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

module.exports = router;