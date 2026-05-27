'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/src/components/Button'
import Input from '@/src/components/Input'
import { sendResetCode, resetPassword } from '@/src/services/authService'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.target)
    const result = await sendResetCode(fd)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setEmail(result.email)
      setStep('code')
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    const codeStr = code.join('')
    if (codeStr.length !== 6) {
      setError('Digite o codigo completo de 6 digitos.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('As senhas nao conferem.')
      return
    }
    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.set('email', email)
    fd.set('code', codeStr)
    fd.set('newPassword', newPassword)

    const result = await resetPassword(fd)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus()
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
            {step === 'email' ? 'Recuperar senha' : 'Redefinir senha'}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 'email' ? 'Digite seu e-mail para receber um codigo de recuperacao' : 'Digite o codigo e sua nova senha'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">{error}</div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-5">
              <Input label="E-mail" type="email" name="email" placeholder="seu@email.com" />
              <Button type="submit" disabled={loading} className="w-full text-base py-3">
                {loading ? 'Enviando...' : 'Enviar codigo'}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Codigo de verificacao
                </label>
                <div className="flex justify-center gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !code[index] && index > 0) {
                          document.getElementById(`code-${index - 1}`)?.focus()
                        }
                      }}
                      className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>
              <Input label="Nova senha" type="password" name="newPassword" placeholder="Minimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input label="Confirmar nova senha" type="password" name="confirmNewPassword" placeholder="Confirme a nova senha" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              <Button type="submit" disabled={loading} className="w-full text-base py-3">
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
