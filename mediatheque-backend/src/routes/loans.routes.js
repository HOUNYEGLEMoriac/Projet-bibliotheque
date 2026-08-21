import { Router } from 'express';
import * as loansController from '../controllers/loans.controller.js';
import * as returnsController from '../controllers/returns.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { role } from '../middlewares/role.middleware.js';
import { createLoanSchema, returnLoanSchema, loanQuerySchema } from '../schemas/loan.schema.js';

const router = Router();

router.use(authMiddleware); // tout le module loans nécessite d'être connecté

router.post('/', role('member', 'admin'), validate(createLoanSchema), loansController.create);
router.get('/', validate(loanQuerySchema, { target: 'query' }), loansController.list);
router.get('/:id', loansController.getOne);
router.post('/:id/renew', loansController.renew);

// Le retour est traité par un admin (bibliothécaire au comptoir)
router.post(
  '/:loanId/return',
  role('admin'),
  validate(returnLoanSchema),
  returnsController.create
);

export default router;
