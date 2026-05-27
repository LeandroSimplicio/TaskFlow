'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/src/components/Button'
import Input from '@/src/components/Input'
import { signUp, verifyEmail, resendVerificationEmail } from '@/src/services/authService'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState('register')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('As senhas nao conferem')
      return
    }
    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.set('name', form.name)
    fd.set('email', form.email)
    fd.set('password', form.password)

    const result = await signUp(fd)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.requireEmailVerification) {
      setRegisteredEmail(result.email)
      setStep('verify')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Digite o codigo completo de 6 digitos.')
      return
    }
    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.set('email', registeredEmail)
    fd.set('otp', code)

    const result = await verifyEmail(fd)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.set('email', registeredEmail)
    await resendVerificationEmail(fd)
    setLoading(false)
  }

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">TF</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'register' ? 'Criar sua conta' : 'Verificar e-mail'}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 'register' ? 'Comece a gerenciar seus projetos' : `Digite o codigo enviado para ${registeredEmail}`}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{error}</div>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <Input label="Nome" type="text" name="name" placeholder="Seu nome completo" value={form.name} onChange={handleChange} />
              <Input label="E-mail" type="email" name="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} />
              <Input label="Senha" type="password" name="password" placeholder="Minimo 6 caracteres" value={form.password} onChange={handleChange} />
              <Input label="Confirmar senha" type="password" name="confirmPassword" placeholder="Confirme sua senha" value={form.confirmPassword} onChange={handleChange} />
              <Button type="submit" disabled={loading} className="w-full text-base py-3">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Codigo de verificacao
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full text-base py-3">
                {loading ? 'Verificando...' : 'Verificar codigo'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                >
                  Reenviar codigo
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ja tem conta?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
