const validator = require('validator');

const validateSignupData = (data) => {
  const errors = [];
  let { firstName, lastName, email, password, age, gender, photoUrl, about, skills } = data;

  // Validate and sanitize firstName
  if (validator.isEmpty(firstName || '')) {
    errors.push({ msg: 'First name is required' });
  } else {
    firstName = validator.trim(firstName);
    firstName = validator.escape(firstName);
  }

  // Validate and sanitize lastName
  if (validator.isEmpty(lastName || '')) {
    errors.push({ msg: 'Last name is required' });
  } else {
    lastName = validator.trim(lastName);
    lastName = validator.escape(lastName);
  }

  // Validate and sanitize email
  if (!validator.isEmail(email || '')) {
    errors.push({ msg: 'Please include a valid email' });
  } else {
    email = validator.normalizeEmail(email);
  }

  // Validate password
  if (!validator.isLength(password || '', { min: 6 })) {
    errors.push({ msg: 'Please enter a password with 6 or more characters' });
  }

  // Validate age
  if (age !== undefined) {
    if (!validator.isInt(String(age), { gt: 0 })) {
      errors.push({ msg: 'Age must be an integer greater than 0' });
    }
    age = parseInt(age, 10);
  }

  // Validate gender
  const validGenders = ['Male', 'Female', 'Other'];
  if (gender !== undefined && !validGenders.includes(gender)) {
    errors.push({ msg: 'Gender must be Male, Female, or Other' });
  }

  // Validate and sanitize photoUrl
  if (photoUrl !== undefined && !validator.isURL(photoUrl || '')) {
    errors.push({ msg: 'Photo URL must be a valid URL' });
  }
  photoUrl = photoUrl ? validator.trim(photoUrl) : photoUrl;

  // Validate and sanitize about
  if (about !== undefined) {
    if (typeof about !== 'string') {
      errors.push({ msg: 'About must be a string' });
    } else {
      about = validator.trim(about);
      about = validator.escape(about);
    }
  }

  // Validate and sanitize skills
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

const validateUpdateData = (data) => {
  const errors = [];
  let { userId, firstName, lastName, email, password, age, gender, photoUrl, about, skills } = data;

  // Validate userId
  if (validator.isEmpty(userId || '')) {
    errors.push({ msg: 'User ID is required' });
  }

  // Validate and sanitize firstName
  if (firstName !== undefined) {
    if (typeof firstName !== 'string' || validator.isEmpty(firstName)) {
      errors.push({ msg: 'First name must be a non-empty string' });
    } else {
      firstName = validator.trim(firstName);
      firstName = validator.escape(firstName);
    }
  }

  // Validate and sanitize lastName
  if (lastName !== undefined) {
    if (typeof lastName !== 'string' || validator.isEmpty(lastName)) {
      errors.push({ msg: 'Last name must be a non-empty string' });
    } else {
      lastName = validator.trim(lastName);
      lastName = validator.escape(lastName);
    }
  }

  // Validate and sanitize email
  if (email !== undefined) {
    if (!validator.isEmail(email)) {
      errors.push({ msg: 'Please include a valid email' });
    } else {
      email = validator.normalizeEmail(email);
    }
  }

  // Validate password
  if (password !== undefined && !validator.isLength(password, { min: 6 })) {
    errors.push({ msg: 'Please enter a password with 6 or more characters' });
  }

  // Validate age
  if (age !== undefined) {
    if (!validator.isInt(String(age), { gt: 0 })) {
      errors.push({ msg: 'Age must be an integer greater than 0' });
    }
    age = parseInt(age, 10);
  }

  // Validate gender
  const validGenders = ['Male', 'Female', 'Other'];
  if (gender !== undefined && !validGenders.includes(gender)) {
    errors.push({ msg: 'Gender must be Male, Female, or Other' });
  }

  // Validate and sanitize photoUrl
  if (photoUrl !== undefined) {
    if (!validator.isURL(photoUrl || '')) {
      errors.push({ msg: 'Photo URL must be a valid URL' });
    }
    photoUrl = validator.trim(photoUrl);
  }

  // Validate and sanitize about
  if (about !== undefined) {
    if (typeof about !== 'string') {
      errors.push({ msg: 'About must be a string' });
    } else {
      about = validator.trim(about);
      about = validator.escape(about);
    }
  }

  // Validate and sanitize skills
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

module.exports = {
  validateSignupData,
  validateUpdateData
};