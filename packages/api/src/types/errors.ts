// ═══════════════════════════════════════════════════════════
// APP ERROR CLASSES
// ═══════════════════════════════════════════════════════════

export class AppError extends Error {
  public readonly userMessage: string;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    userMessage: string,
    code: string,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(userMessage);
    this.name = 'AppError';
    this.userMessage = userMessage;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('البيانات المُرسلة غير صحيحة', 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg: string = 'يجب تسجيل الدخول أولاً') {
    super(msg, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(msg: string = 'ليس لديك صلاحية للقيام بهذا الإجراء') {
    super(msg, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'العنصر') {
    super(`${resource} غير موجود`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(msg: string) {
    super(msg, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(userMessage: string, code: string, details?: unknown) {
    super(userMessage, code, 422, details);
    this.name = 'BusinessRuleError';
  }
}

export class InsufficientTokensError extends AppError {
  constructor(required: number, available: number) {
    super(
      `رصيد Token غير كافٍ. المطلوب: ${required}، المتاح: ${available}`,
      'INSUFFICIENT_TOKENS',
      422,
      { required, available }
    );
    this.name = 'InsufficientTokensError';
  }
}

export class BlockedByRiskError extends AppError {
  constructor(reasons: string[]) {
    super(
      'لا يمكن المتابعة. يجب تحسين الوضع المالي أولاً.',
      'FINANCIAL_RISK_BLOCKING',
      422,
      { reasons }
    );
    this.name = 'BlockedByRiskError';
  }
}

export class ProjectLockedError extends AppError {
  constructor() {
    super(
      'المشروع قيد المعالجة حالياً. الرجاء الانتظار.',
      'PROJECT_LOCKED',
      409
    );
    this.name = 'ProjectLockedError';
  }
}

export class AIGenerationError extends AppError {
  constructor(attempts: number) {
    super(
      `فشل إنشاء المحتوى بعد ${attempts} محاولات. تم استرداد الـ Tokens.`,
      'AI_GENERATION_FAILED',
      500
    );
    this.name = 'AIGenerationError';
  }
}
