import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
const payload = await getPayload({ config })
const p = (t: string) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '', children: [{ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }] }] } })
const form = await payload.create({ collection: 'forms', data: {
  title: 'TEST all field types', submitButtonLabel: 'Send test', confirmationType: 'message', confirmationMessage: p('Test thank-you message.'),
  showConsent: false, showCaptcha: false, autoReply: false, notifyTo: 'webaidev2927@gmail.com',
  fields: [
    { blockType: 'text', name: 'name', label: 'Your name', required: true, width: 50, placeholder: 'Name', errorMessage: 'Apna naam likhiye' },
    { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
    { blockType: 'message', message: p('Please tell us about your budget and timeline.') },
    { blockType: 'select', name: 'budget', label: 'Budget', required: true, width: 50, placeholder: 'Choose a budget', options: [{ label: 'Under $10k', value: 'u10' }, { label: '$10k–$50k', value: '10-50' }] },
    { blockType: 'number', name: 'team', label: 'Team size', width: 50 },
    { blockType: 'date', name: 'start', label: 'Start date', width: 100 },
    { blockType: 'checkbox', name: 'nda', label: 'We need an NDA', required: true },
  ],
} as never })
const page = await payload.create({ collection: 'pages', context: { disableRevalidate: true }, data: { title: 'Form test', path: '/form-test', template: 'main', _status: 'published', layout: [{ blockType: 'formSection', form: form.id, heading: 'Test form', text: p('All field types.') }] } as never })
console.log(`created form ${form.id} and page ${page.id}`)
process.exit(0)
