import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { pool } from '../database';
import { Form, FormSubmission, ApiResponse } from '../../../shared/types';

const router = Router();

// Validation schemas
const formSchema = Joi.object({
    name: Joi.string().min(1).trim().required().messages({
        'string.empty': 'Form name cannot be empty',
        'string.min': 'Form name must be at least 1 character long',
        'any.required': 'Form name is required'
    }),
    fields: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('text', 'dropdown', 'table', 'file').required(),
        question: Joi.string().required(),
        required: Joi.boolean().required(),
        columnId: Joi.string().optional(),
        sectionId: Joi.string().optional(),
        validation: Joi.object().optional(),
        options: Joi.array().optional(),
        tableColumns: Joi.array().optional(),
        conditionalLogic: Joi.object({
            conditions: Joi.array().items(Joi.object({
                answer: Joi.string().required(),
                targetSectionId: Joi.string().required()
            }))
        }).optional()
    })).required(),
    columns: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        width: Joi.number().required(),
        fieldIds: Joi.array().items(Joi.string()).required()
    })).required(),
    sections: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional().allow(''),
        order: Joi.number().required(),
        columns: Joi.array().items(Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required(),
            width: Joi.number().required(),
            fieldIds: Joi.array().items(Joi.string()).required()
        })).optional(),
        allowSubmit: Joi.boolean().optional(),
        allowNext: Joi.boolean().optional(),
        nextSectionId: Joi.string().optional().allow('')
    })).optional().default([])
});

const submissionSchema = Joi.object({
    formId: Joi.string().required(),
    data: Joi.object().required()
});

// Get all forms
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM forms ORDER BY created_at DESC');
        const forms = (rows as any[]).map(row => ({
            ...row,
            fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
            columns: typeof row.columns === 'string' ? JSON.parse(row.columns) : row.columns
        }));

        const response: ApiResponse<Form[]> = { success: true, data: forms };
        res.json(response);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch forms' });
    }
});

// Get form by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM forms WHERE id = ?', [req.params.id]);
        const forms = rows as any[];

        if (forms.length === 0) {
            return res.status(404).json({ success: false, error: 'Form not found' });
        }

        const form = {
            ...forms[0],
            fields: typeof forms[0].fields === 'string' ? JSON.parse(forms[0].fields) : forms[0].fields,
            columns: typeof forms[0].columns === 'string' ? JSON.parse(forms[0].columns) : forms[0].columns,
            sections: forms[0].sections ? (typeof forms[0].sections === 'string' ? JSON.parse(forms[0].sections) : forms[0].sections) : []
        };

        const response: ApiResponse<Form> = { success: true, data: form };
        res.json(response);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch form' });
    }
});

// Create form
router.post('/', async (req: Request, res: Response) => {
    try {
        console.log('Creating form with data:', JSON.stringify(req.body, null, 2));
        const { error, value } = formSchema.validate(req.body);
        if (error) {
            console.error('Validation error:', error.details);
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const id = uuidv4();
        const { name, fields, columns, sections } = value;

        await pool.execute(
            'INSERT INTO forms (id, name, fields, columns, sections) VALUES (?, ?, ?, ?, ?)',
            [id, name, JSON.stringify(fields), JSON.stringify(columns), JSON.stringify(sections || [])]
        );

        console.log('Form created successfully with ID:', id);
        const response: ApiResponse<{ id: string }> = { success: true, data: { id } };
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating form:', error);
        console.error('Error details:', error);
        res.status(500).json({ success: false, error: 'Failed to create form: ' + (error as Error).message });
    }
});

// Update form
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { error, value } = formSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const { name, fields, columns, sections } = value;

        const [result] = await pool.execute(
            'UPDATE forms SET name = ?, fields = ?, columns = ?, sections = ? WHERE id = ?',
            [name, JSON.stringify(fields), JSON.stringify(columns), JSON.stringify(sections || []), req.params.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Form not found' });
        }

        const response: ApiResponse<null> = { success: true };
        res.json(response);
    } catch (error) {
        console.error('Error updating form:', error);
        console.error('Error details:', error);
        res.status(500).json({ success: false, error: 'Failed to update form: ' + (error as Error).message });
    }
});

// Delete form
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const [result] = await pool.execute('DELETE FROM forms WHERE id = ?', [req.params.id]);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Form not found' });
        }

        const response: ApiResponse<null> = { success: true };
        res.json(response);
    } catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).json({ success: false, error: 'Failed to delete form' });
    }
});

// Submit form
router.post('/:id/submit', async (req: Request, res: Response) => {
    try {
        console.log('Submitting form:', req.params.id, 'with data:', JSON.stringify(req.body, null, 2));

        // First check if the form exists
        const [formRows] = await pool.execute('SELECT id FROM forms WHERE id = ?', [req.params.id]);
        if ((formRows as any[]).length === 0) {
            return res.status(404).json({ success: false, error: 'Form not found' });
        }

        const submissionData = { formId: req.params.id, data: req.body };
        const { error, value } = submissionSchema.validate(submissionData);

        if (error) {
            console.error('Submission validation error:', error.details);
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        const id = uuidv4();
        const { formId, data } = value;

        await pool.execute(
            'INSERT INTO form_submissions (id, form_id, data) VALUES (?, ?, ?)',
            [id, formId, JSON.stringify(data)]
        );

        console.log('Form submission created successfully with ID:', id);
        const response: ApiResponse<{ id: string }> = { success: true, data: { id } };
        res.status(201).json(response);
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ success: false, error: 'Failed to submit form' });
    }
});

// Get form submissions
router.get('/:id/submissions', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM form_submissions WHERE form_id = ? ORDER BY submitted_at DESC',
            [req.params.id]
        );

        const submissions = (rows as any[]).map(row => ({
            ...row,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        }));

        const response: ApiResponse<FormSubmission[]> = { success: true, data: submissions };
        res.json(response);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
});

export default router;