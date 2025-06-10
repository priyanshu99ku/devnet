const validator = require('validator'); // Imports the validator library for robust data validation and sanitization.

// Validates and sanitizes data for user signup.
const validateSignupData = (data) => {
  const errors = [];
  const sanitizedData = {}; // Directly use sanitizedData for clearer assignment
  const { firstName, lastName, email, password, age, gender, photoUrl, about, skills } = data;

  // Validate and sanitize firstName
  if (validator.isEmpty(firstName || '')) {
    errors.push({ msg: 'First name is required' });
  } else {
    sanitizedData.firstName = validator.trim(firstName);
    sanitizedData.firstName = validator.escape(sanitizedData.firstName);
  }

  // Validate and sanitize lastName
  if (validator.isEmpty(lastName || '')) {
    errors.push({ msg: 'Last name is required' });
  } else {
    sanitizedData.lastName = validator.trim(lastName);
    sanitizedData.lastName = validator.escape(sanitizedData.lastName);
  }

  // Validate and sanitize email
  if (!validator.isEmail(email || '')) {
    errors.push({ msg: 'Please include a valid email' });
  } else {
    sanitizedData.email = validator.normalizeEmail(email);
  }

  // Validate password
  if (!validator.isLength(password || '', { min: 6 })) {
    errors.push({ msg: 'Please enter a password with 6 or more characters' });
  }
  sanitizedData.password = password; // Password kept as is for schema hashing

  // Validate age (optional)
  if (age !== undefined) {
    if (!validator.isInt(String(age || ''), { gt: 0 })) { // Ensure string for validator.isInt
      errors.push({ msg: 'Age must be an integer greater than 0' });
    } else {
      sanitizedData.age = parseInt(age, 10);
    }
  }

  // Validate gender (optional)
  const validGenders = ['Male', 'Female', 'Other'];
  if (gender !== undefined) {
    if (!validGenders.includes(gender)) {
      errors.push({ msg: 'Gender must be Male, Female, or Other' });
    } else {
      sanitizedData.gender = gender;
    }
  }

  // Validate and sanitize photoUrl (optional)
  if (photoUrl !== undefined) {
    if (!validator.isURL(photoUrl || '')) { // Ensure string for validator.isURL
      errors.push({ msg: 'Photo URL must be a valid URL' });
    } else {
      sanitizedData.photoUrl = validator.trim(photoUrl);
      // No escape for URL as it might break the URL
    }
  }

  // Validate and sanitize about (optional)
  if (about !== undefined) {
    if (typeof about !== 'string') {
      errors.push({ msg: 'About must be a string' });
    } else {
      sanitizedData.about = validator.trim(about);
      sanitizedData.about = validator.escape(sanitizedData.about);
    }
  }

  // Validate and sanitize skills (optional)
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      errors.push({ msg: 'Skills must be an array' });
    } else {
      sanitizedData.skills = skills.map(skill => {
        if (typeof skill !== 'string') {
          errors.push({ msg: 'Each skill must be a string' });
          return null;
        }
        return validator.trim(validator.escape(skill));
      }).filter(skill => skill !== null);
    }
  }

  return {
    errors,
    sanitizedData
  };
};

// Validates and sanitizes data for user profile updates.
// Handles optional fields gracefully (only validates/sanitizes if present).
const validateUpdateData = (data) => {
  const errors = [];
  let { userId, firstName, lastName, email, password, age, gender, photoUrl, about, skills } = data;

  // Validate userId: Required for identifying the user to update.
  if (validator.isEmpty(userId || '')) {
    errors.push({ msg: 'User ID is required' });
  }

  // Validate and sanitize firstName (if provided).
  if (firstName !== undefined) {
    if (typeof firstName !== 'string' || validator.isEmpty(firstName)) {
      errors.push({ msg: 'First name must be a non-empty string' });
    } else {
      firstName = validator.trim(firstName);
      firstName = validator.escape(firstName);
    }
  }

  // Validate and sanitize lastName (if provided).
  if (lastName !== undefined) {
    if (typeof lastName !== 'string' || validator.isEmpty(lastName)) {
      errors.push({ msg: 'Last name must be a non-empty string' });
    } else {
      lastName = validator.trim(lastName);
      lastName = validator.escape(lastName);
    }
  }

  // Validate and sanitize email (if provided).
  if (email !== undefined) {
    if (!validator.isEmail(email)) {
      errors.push({ msg: 'Please include a valid email' });
    } else {
      email = validator.normalizeEmail(email);
    }
  }

  // Validate password (if provided) for length.
  if (password !== undefined && !validator.isLength(password, { min: 6 })) {
    errors.push({ msg: 'Please enter a password with 6 or more characters' });
  }

  // Validate age (if provided).
  if (age !== undefined) {
    if (!validator.isInt(String(age), { gt: 0 })) {
      errors.push({ msg: 'Age must be an integer greater than 0' });
    }
    age = parseInt(age, 10);
  }

  // Validate gender (if provided).
  const validGenders = ['Male', 'Female', 'Other'];
  if (gender !== undefined && !validGenders.includes(gender)) {
    errors.push({ msg: 'Gender must be Male, Female, or Other' });
  }

  // Validate and sanitize photoUrl (if provided).
  if (photoUrl !== undefined) {
    if (!validator.isURL(photoUrl || '')) {
      errors.push({ msg: 'Photo URL must be a valid URL' });
    }
    photoUrl = validator.trim(photoUrl);
  }

  // Validate and sanitize about (if provided).
  if (about !== undefined) {
    if (typeof about !== 'string') {
      errors.push({ msg: 'About must be a string' });
    } else {
      about = validator.trim(about);
      about = validator.escape(about);
    }
  }

  // Validate and sanitize skills (if provided).
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      errors.push({ msg: 'Skills must be an array' });
    } else {
      skills = skills.map(skill => {
        if (typeof skill !== 'string') {
          errors.push({ msg: 'Each skill must be a string' });
          return null;
        }
        return validator.trim(validator.escape(skill));
      }).filter(skill => skill !== null);
    }
  }

  return {
    errors,
    sanitizedData: {
      userId,
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills
    }
  };
};

module.exports = { // Exports functions for use in other modules (e.g., app.js).
  validateSignupData,
  validateUpdateData
};