// Teste automatizado para Tarefa 2: Política de Senha Forense Unificada
import { validatePassword } from '../src/utils/passwordPolicy.js';

console.log('=== TESTE AUTOMATIZADO DA POLÍTICA DE SENHA (TAREFA 2) ===\n');

const testCases = [
  { pwd: '123', expected: false, desc: 'Muito curta (<8)' },
  { pwd: 'senhaminusc123!', expected: false, desc: 'Sem maiúscula' },
  { pwd: 'SENHAMAIUSC123!', expected: false, desc: 'Sem minúscula' },
  { pwd: 'SenhaSemNumero!', expected: false, desc: 'Sem número' },
  { pwd: 'SenhaSemEspecial123', expected: false, desc: 'Sem caractere especial' },
  { pwd: 'SenhaForte@2026', expected: true, desc: 'Senha completa forense' }
];

let allPassed = true;

for (const tc of testCases) {
  const result = validatePassword(tc.pwd);
  const passed = result.isValid === tc.expected;
  if (!passed) allPassed = false;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.desc}: isValid=${result.isValid} (score=${result.score}/5)`);
  if (!result.isValid) {
    console.log(`       Mensagem: ${result.error}`);
  }
}

console.log('\nResultado do teste da política de senha:', allPassed ? '✅ 100% SUCESSO' : '❌ FALHA');
if (!allPassed) process.exit(1);

