import { body, validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please verify submitted form fields.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
}

export const validateLogin = [
  body('email').trim().isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password cannot be empty.'),
  handleValidationErrors
];

export const validateBloodRequest = [
  body('bloodBankId').isInt({ min: 1 }).withMessage('Valid blood bank must be selected.'),
  body('patientReference').trim().notEmpty().withMessage('Patient or reference ID is required.'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required.'),
  body('bloodComponent')
    .isIn(['Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate'])
    .withMessage('Valid blood component is required.'),
  body('quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20 units.'),
  body('urgency')
    .isIn(['ROUTINE', 'URGENT', 'CRITICAL_EMERGENCY'])
    .withMessage('Urgency level must be ROUTINE, URGENT, or CRITICAL_EMERGENCY.'),
  body('requiredByTime').notEmpty().withMessage('Required-by date and time is required.'),
  body('designatedReceiverId').isInt({ min: 1 }).withMessage('Designated hospital receiver is required.'),
  handleValidationErrors
];

export const validateInventoryItem = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required.'),
  body('bloodComponent')
    .isIn(['Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate'])
    .withMessage('Valid blood component is required.'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
  body('batchNumber').trim().notEmpty().withMessage('Batch or donor unit number is required.'),
  body('collectionDate').isISO8601().withMessage('Valid collection date is required.'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required.'),
  handleValidationErrors
];

export const validateDispatch = [
  body('droneIdentifier').trim().notEmpty().withMessage('Drone identifier is required.'),
  body('estimatedFlightMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Flight duration must be positive.'),
  handleValidationErrors
];

export const validatePasskeyVerification = [
  body('passkey')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Passkey must be a 6-digit numeric code.'),
  handleValidationErrors
];

export const validateContactInquiry = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('organizationName').trim().notEmpty().withMessage('Organization name is required.'),
  body('organizationType')
    .isIn(['Hospital', 'Blood Bank', 'Healthcare Organization', 'Technology Partner', 'Individual', 'Other'])
    .withMessage('Valid organization type is required.'),
  body('subject').trim().notEmpty().withMessage('Subject is required.'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.'),
  handleValidationErrors
];
