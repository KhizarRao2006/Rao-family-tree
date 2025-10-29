/**
 * Validate family member data
 * @param {Object} data - Family member data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation
 * @returns {Object} Validation result
 */
function validateFamilyMember(data, isUpdate = false) {
  const errors = [];
  
  // Required fields for creation
  if (!isUpdate) {
    if (!data.first_name || data.first_name.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!data.last_name || data.last_name.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!data.generation || isNaN(parseInt(data.generation))) {
      errors.push('Valid generation is required');
    }
  }
  
  // Field-specific validations
  if (data.first_name && data.first_name.trim().length > 100) {
    errors.push('First name must be less than 100 characters');
  }
  
  if (data.last_name && data.last_name.trim().length > 100) {
    errors.push('Last name must be less than 100 characters');
  }
  
  if (data.birth_year && (isNaN(parseInt(data.birth_year)) || data.birth_year < 1700 || data.birth_year > new Date().getFullYear())) {
    errors.push('Birth year must be a valid year');
  }
  
  if (data.death_year && (isNaN(parseInt(data.death_year)) || data.death_year < 1700 || data.death_year > new Date().getFullYear())) {
    errors.push('Death year must be a valid year');
  }
  
  if (data.birth_year && data.death_year && parseInt(data.death_year) < parseInt(data.birth_year)) {
    errors.push('Death year cannot be before birth year');
  }
  
  if (data.generation && (isNaN(parseInt(data.generation)) || data.generation < 1 || data.generation > 20)) {
    errors.push('Generation must be between 1 and 20');
  }
  
  if (data.parent_id && isNaN(parseInt(data.parent_id))) {
    errors.push('Parent ID must be a valid number');
  }
  
  if (data.photo_url && data.photo_url.length > 500) {
    errors.push('Photo URL must be less than 500 characters');
  }
  
  if (data.biography && data.biography.length > 2000) {
    errors.push('Biography must be less than 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateFamilyMember
};