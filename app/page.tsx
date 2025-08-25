import path from 'path';
import { promises as fs } from 'fs';
import QuizClient from '@/components/QuizClient';
import styles from './HomePage.module.css';
import { Brain, Heart, Users, Target, BookOpen, Award } from 'lucide-react';
import Image from 'next/image';

export default async function HomePage() {
  const dataDirectory = path.join(process.cwd(), 'public/data');
  const questionsFile = await fs.readFile(dataDirectory + '/questions.json', 'utf8');
  const denominationsFile = await fs.readFile(dataDirectory + '/denominations.json', 'utf8');
  const questions = JSON.parse(questionsFile);
  const denominations = JSON.parse(denominationsFile);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <Image 
              src="/logo.svg" 
              alt="Quiz Denominacional" 
              width={80} 
              height={80}
              className={styles.logo}
            />
          </div>
          <h1 className={styles.heading}>
            Qual denominação se alinha mais comigo?
          </h1>
          <p className={styles.subheading}>
            Descubra sua afinidade teológica através de um quiz inteligente e personalizado
          </p>
        </header>

        <div className={styles.introCard}>
          <p className={styles.intro}>
            Muitas pessoas sabem que acreditam em Deus e confiam em Jesus, mas têm dificuldade em se envolver
            em uma comunidade cristã devido à tarefa de selecionar uma denominação.
            Este quiz apresentará crenças de diferentes denominações e pedirá que você
            escolha com qual mais concorda. Ele então dirá com qual(is) denominação(ões) suas crenças
            são mais semelhantes. Se você não tiver uma opinião forte sobre um assunto, sinta-se à vontade
            para deixar a pergunta em branco.
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <Brain className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Análise Inteligente</h3>
            <p className={styles.featureDescription}>
              Algoritmo avançado que analisa suas respostas e encontra as denominações mais compatíveis
            </p>
          </div>
          
          <div className={styles.feature}>
            <Heart className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Resultado Personalizado</h3>
            <p className={styles.featureDescription}>
              Receba um resultado único baseado em suas crenças e valores pessoais
            </p>
          </div>
          
          <div className={styles.feature}>
            <Users className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Múltiplas Denominações</h3>
            <p className={styles.featureDescription}>
              Explore diferentes tradições cristãs e descubra onde você se encaixa melhor
            </p>
          </div>
          
          <div className={styles.feature}>
            <Target className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Perguntas Precisas</h3>
            <p className={styles.featureDescription}>
              Questões cuidadosamente elaboradas para identificar suas inclinações teológicas
            </p>
          </div>
          
          <div className={styles.feature}>
            <BookOpen className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Base Bíblica</h3>
            <p className={styles.featureDescription}>
              Todas as perguntas são fundamentadas em princípios bíblicos e teológicos
            </p>
          </div>
          
          <div className={styles.feature}>
            <Award className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Resultado Detalhado</h3>
            <p className={styles.featureDescription}>
              Receba uma análise completa com porcentagens de afinidade para cada denominação
            </p>
          </div>
        </div>

        <div className={styles.quizContainer}>
          <QuizClient questions={questions} denominations={denominations} />
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              © 2025 Quiz Denominacional. Desenvolvido por{' '}
              <a 
                href="https://github.com/rilsonjoas" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Rilson Joás
              </a>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}