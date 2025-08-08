'use client';

import { useRef, useState, useEffect } from 'react';
import { ResultItem } from '@/lib/types';
import html2canvas from 'html2canvas';
import styles from './Results.module.css';
import { 
  Trophy, 
  Award, 
  Share2, 
  Download, 
  Copy, 
  CheckCircle, 
  TrendingUp,
  Star,
  Heart,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ResultsProps {
  results: ResultItem[];
  answeredCount: number;
}

export default function Results({ results }: ResultsProps) {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Pega os 3 melhores resultados para a imagem gerada
  const topResultsForImage = results.slice(0, 3);

  // Função para gerar a imagem do resultado usando html2canvas
  const generateImage = async () => {
    if (!resultCardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      setImageDataUrl(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Não foi possível gerar a imagem do resultado.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para copiar a imagem para a área de transferência
  const handleCopyImage = async () => {
    if (!imageDataUrl) return;

    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Falha ao copiar:', error);
      alert('Seu navegador não suporta esta função ou a permissão foi negada. Por favor, use o botão de download.');
    }
  };

  // useEffect para gerar a imagem automaticamente quando o componente for renderizado
  useEffect(() => {
    generateImage();
  }, [results]);

  const getTopResult = () => results[0];
  const getSecondResult = () => results[1];
  const getThirdResult = () => results[2];

  const getResultIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className={styles.resultIcon} />;
      case 2: return <Award className={styles.resultIcon} />;
      case 3: return <Star className={styles.resultIcon} />;
      default: return <Heart className={styles.resultIcon} />;
    }
  };

  const getResultColor = (position: number) => {
    switch (position) {
      case 1: return 'var(--color-accent)';
      case 2: return 'var(--color-primary)';
      case 3: return 'var(--color-secondary)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div id="results-section" className={styles.resultsSection}>
      {/* Header dos Resultados */}
      <div className={styles.resultsHeader}>
        <div className={styles.resultsTitle}>
          <Sparkles className={styles.resultsIcon} />
          <h2>Seu Resultado</h2>
        </div>
        <p className={styles.resultsSubtitle}>
          Com base nas suas respostas, aqui estão as denominações mais alinhadas com suas crenças:
        </p>
      </div>

      {/* Top 3 Resultados */}
      <div className={styles.topResults}>
        {/* Primeiro Lugar */}
        {getTopResult() && (
          <div className={`${styles.resultCard} ${styles.firstPlace}`}>
            <div className={styles.resultRank}>
              {getResultIcon(1)}
              <span className={styles.rankNumber}>1º</span>
            </div>
            <div className={styles.resultContent}>
              <h3 className={styles.resultName}>{getTopResult().name}</h3>
              <div className={styles.resultScore}>
                <TrendingUp className={styles.scoreIcon} />
                <span className={styles.scoreValue}>{getTopResult().percentage}%</span>
                <span className={styles.scoreLabel}>de afinidade</span>
              </div>
              <div className={styles.resultDetails}>
                <span>{getTopResult().score} ponto(s) correspondente(s)</span>
              </div>
            </div>
          </div>
        )}

        {/* Segundo e Terceiro Lugar */}
        <div className={styles.secondaryResults}>
          {getSecondResult() && (
            <div className={`${styles.resultCard} ${styles.secondPlace}`}>
              <div className={styles.resultRank}>
                {getResultIcon(2)}
                <span className={styles.rankNumber}>2º</span>
              </div>
              <div className={styles.resultContent}>
                <h4 className={styles.resultName}>{getSecondResult().name}</h4>
                <div className={styles.resultScore}>
                  <span className={styles.scoreValue}>{getSecondResult().percentage}%</span>
                </div>
              </div>
            </div>
          )}

          {getThirdResult() && (
            <div className={`${styles.resultCard} ${styles.thirdPlace}`}>
              <div className={styles.resultRank}>
                {getResultIcon(3)}
                <span className={styles.rankNumber}>3º</span>
              </div>
              <div className={styles.resultContent}>
                <h4 className={styles.resultName}>{getThirdResult().name}</h4>
                <div className={styles.resultScore}>
                  <span className={styles.scoreValue}>{getThirdResult().percentage}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista Completa de Resultados */}
      <div className={styles.allResults}>
        <h3 className={styles.allResultsTitle}>
          <CheckCircle className={styles.allResultsIcon} />
          Todas as Denominações
        </h3>
        <div className={styles.resultsList}>
          {results.slice(0, 10).map((item, index) => (
            <div key={item.name} className={styles.resultItem}>
              <div className={styles.resultItemRank}>
                <span className={styles.resultItemNumber}>{index + 1}</span>
              </div>
              <div className={styles.resultItemContent}>
                <strong className={styles.resultItemName}>{item.name}</strong>
                <div className={styles.resultItemScore}>
                  <span className={styles.resultItemPercentage}>{item.percentage}%</span>
                  <span className={styles.resultItemPoints}>({item.score} pontos)</span>
                </div>
              </div>
              <div className={styles.resultItemBar}>
                <div 
                  className={styles.resultItemBarFill}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <p>
          <strong>Lembre-se:</strong> Este é um quiz simplificado. Conhecer sua linha teológica leva tempo. 
          Consulte também pessoas de diversas comunidades e estude as doutrinas das denominações que mais 
          se alinharam com suas respostas.
        </p>
      </div>

      {/* Compartilhamento */}
      <div className={styles.shareContainer}>
        <h3 className={styles.shareHeading}>
          <Share2 className={styles.shareIcon} />
          Compartilhe seu Resultado
        </h3>
        
        <div className={styles.imagePreview}>
          {isGenerating && (
            <div className={styles.generatingImage}>
              <RefreshCw className={styles.generatingIcon} />
              <p>Gerando imagem...</p>
            </div>
          )}
          {imageDataUrl && (
            <img 
              src={imageDataUrl} 
              alt="Resultado do Quiz" 
              className={styles.previewImage} 
            />
          )}
        </div>

        {imageDataUrl && (
          <div className={styles.actionButtons}>
            <a
              href={imageDataUrl}
              download="meu_resultado_quiz.png"
              className={`${styles.actionButton} ${styles.downloadButton}`}
            >
              <Download className={styles.actionIcon} />
              Baixar Imagem
            </a>
            <button
              onClick={handleCopyImage}
              className={`${styles.actionButton} ${styles.copyButton} ${
                copyStatus === 'copied' ? styles.copied : ''
              }`}
              disabled={copyStatus === 'copied'}
            >
              {copyStatus === 'copied' ? (
                <>
                  <CheckCircle className={styles.actionIcon} />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className={styles.actionIcon} />
                  Copiar Imagem
                </>
              )}
            </button>
          </div>
        )}
        
        <p className={styles.shareDisclaimer}>
          Baixe ou copie a imagem e compartilhe nas suas redes sociais!
        </p>
      </div>

      {/* Elemento oculto para gerar imagem */}
      <div ref={resultCardRef} className={styles.hiddenCard}>
        <div className={styles.hiddenCardContent}>
          <h2 className={styles.hiddenCardTitle}>
            <Sparkles className={styles.hiddenCardIcon} />
            Meu resultado no Quiz Denominacional!
          </h2>
          
          <div className={styles.hiddenCardResults}>
            {topResultsForImage.map((item, index) => (
              <div key={item.name} className={styles.hiddenCardResult}>
                <div className={styles.hiddenCardRank}>
                  {getResultIcon(index + 1)}
                  <span>{index + 1}º</span>
                </div>
                <div className={styles.hiddenCardInfo}>
                  <strong>{item.name}</strong>
                  <span>{item.percentage}% de afinidade</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.hiddenCardFooter}>
            <p>Descubra o seu também!</p>
            <p>Gerado por Quiz Denominacional</p>
          </div>
        </div>
      </div>
    </div>
  );
}