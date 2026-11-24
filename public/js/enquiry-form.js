/*
 * Forms marked data-enquiry-form: the "Form" section (forms built in Leads → Forms), the "Enquiry form" section and
 * the Contact page form. Checks the fields, then sends them with any files to /forms/enquiry as multipart form data
 * (the server checks everything again). Shows the thank-you box on success (or goes to the form's redirect page),
 * or an error message.
 *  - data-error on a field: its own error message (set per field in Leads → Forms).
 *  - data-types / data-max-mb on a file field: allowed file types and maximum size.
 *  - The captcha is set up by common.min.js, which marks a wrong answer invalid.
 */
(function () {
  'use strict'
  if (window.__enquiryForm) return
  window.__enquiryForm = true

  var MAX_MB = 4
  var FIELD_NAMES = { name: 'your name', email: 'your email', phone: 'your phone number', message: 'a message' }

  /** What the field asks for, from its label's data-label ("full name") or the field name. */
  function fieldName(input) {
    var label = input.form.querySelector('label[for="' + input.id + '"]')
    var named = label && label.getAttribute('data-label')
    return named ? 'your ' + named : FIELD_NAMES[input.name] || 'this field'
  }

  function setError(input, text) {
    var id = input.id + '-err'
    var el = document.getElementById(id)
    if (!el) {
      el = document.createElement('p')
      el.className = 'field-error'
      el.id = id
      // Below the styled file box / checkbox label, so the error does not break their layout.
      var anchor = input.closest('.git-file-box, .git-agree') || input
      anchor.insertAdjacentElement('afterend', el)
      input.setAttribute('aria-describedby', id)
    }
    el.textContent = text || ''
    input.setAttribute('aria-invalid', text ? 'true' : 'false')
  }

  function fileError(input) {
    var file = input.files && input.files[0]
    if (!file) return input.required ? 'Please attach ' + fieldName(input).replace(/^your /, 'a ') + '.' : ''
    var types = (input.getAttribute('data-types') || '').toLowerCase().split(',')
    var ext = (file.name.match(/\.[^.]+$/) || [''])[0].toLowerCase()
    var mb = Number(input.getAttribute('data-max-mb')) || MAX_MB
    if (types.indexOf(ext) < 0) return 'This file type is not accepted. Allowed: ' + types.join(', ') + '.'
    if (file.size > mb * 1024 * 1024) return 'The file is too large (maximum ' + mb + ' MB).'
    return ''
  }

  function check(input) {
    if (input.type === 'hidden' || input.classList.contains('hp') || input.name === 'company_website') return true
    var custom = input.getAttribute('data-error')
    var text = ''
    if (input.type === 'file') {
      text = fileError(input)
    } else {
      if (input.value && typeof input.value === 'string' && !input.value.trim()) input.value = ''
      var v = input.validity
      if (v.valid) text = ''
      else if (v.customError) text = input.validationMessage // e.g. the captcha's "Enter the correct answer."
      else if (v.valueMissing && input.type === 'checkbox')
        text =
          input.name === 'marketing'
            ? 'Please agree to the Privacy Policy to continue.'
            : 'Please tick “' + ((input.closest('label') || {}).textContent || '').replace(/\*\s*$/, '').trim() + '”.'
      else if (v.valueMissing && input.tagName === 'SELECT') text = 'Please choose ' + fieldName(input) + '.'
      else if (v.valueMissing) text = 'Please enter ' + fieldName(input) + '.'
      else if (v.typeMismatch) text = 'Enter an email address like name@company.com.'
      else if (v.patternMismatch) text = 'Enter a valid phone number, for example +61 412 345 678.'
      else if (v.badInput || v.rangeUnderflow || v.rangeOverflow) text = 'Enter a valid number.'
      else text = input.validationMessage
    }
    // The field's own message replaces the standard one (not the captcha's).
    if (text && custom && input.name !== 'captcha') text = custom
    setError(input, text)
    return !text
  }

  function init(form) {
    var button = form.querySelector('button[type="submit"]')
    var label = button.textContent
    var errors = form.querySelector('.form-errors')
    var done = form.parentElement.querySelector('.form-done')

    form.addEventListener('focusout', function (e) {
      if (e.target.name && e.target.value) check(e.target)
    })
    form.addEventListener('change', function (e) {
      if (e.target.type === 'file' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT') check(e.target)
    })

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'))
      var bad = inputs.filter(function (i) {
        return !check(i)
      })
      if (bad.length) {
        bad[0].focus()
        return
      }

      var data = new FormData(form)
      data.append('form_id', form.getAttribute('data-form-id') || form.id)
      data.append('page', location.pathname)
      data.append('referrer', document.referrer || '')
      button.disabled = true
      button.textContent = 'Sending…'
      if (errors) errors.hidden = true

      fetch('/forms/enquiry', { method: 'POST', body: data })
        .then(function (res) {
          return res.json().catch(function () { return {} }).then(function (json) {
            if (!res.ok || !json.ok) throw new Error(json.error || 'HTTP ' + res.status)
          })
        })
        .then(function () {
          if (window.dataLayer) window.dataLayer.push({ event: 'form_submit', form_id: form.id })
          var redirect = form.getAttribute('data-redirect')
          if (redirect) {
            location.href = redirect
            return
          }
          form.hidden = true
          if (done) {
            done.hidden = false
            done.focus()
          }
        })
        .catch(function (err) {
          button.disabled = false
          button.textContent = label
          if (!errors) return
          errors.hidden = false
          errors.textContent = 'Sorry, your enquiry could not be sent (' + err.message + '). Please try again in a moment.'
          errors.focus()
        })
    })
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-enquiry-form]'), init)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
