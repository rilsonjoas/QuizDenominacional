document.addEventListener("DOMContentLoaded", async () => {
  const quizContainer = document.getElementById("quiz-container");
  const submitButton = document.getElementById("submit-btn");
  const resultsContainer = document.getElementById("results-container");
  const resultsOutput = document.getElementById("results-output");
  const loader = document.createElement("div");
  loader.classList.add("loader");
  if (quizContainer && quizContainer.parentNode) {
    quizContainer.parentNode.insertBefore(loader, quizContainer);
  }

  const shareImageContainer = document.getElementById("share-image-container");
  const downloadImageLink = document.getElementById("download-image-link");
  const copyImageBtn = document.getElementById("copy-image-btn"); 
  const resultCardForImage = document.getElementById("result-card-for-image");
  const resultCardContent = document.getElementById("result-card-content");
  const resultImagePreviewArea = document.getElementById(
    "result-image-preview-area"
  );

  let questions = [];
  let denominations = [];
  let currentImageDataUrl = null;

  async function loadQuizData() {
    if (loader) loader.style.display = "block";
    if (quizContainer) quizContainer.style.display = "none";
    if (submitButton) submitButton.style.display = "none";
    try {
      const [questionsRes, denominationsRes] = await Promise.all([
        fetch("questions.json"),
        fetch("denominations.json"),
      ]);

      if (!questionsRes.ok || !denominationsRes.ok) {
        let errorMsg = "Falha ao carregar dados do quiz.";
        if (!questionsRes.ok)
          errorMsg +=
            " (Erro ao buscar questions.json: " + questionsRes.status + ")";
        if (!denominationsRes.ok)
          errorMsg +=
            " (Erro ao buscar denominations.json: " +
            denominationsRes.status +
            ")";
        throw new Error(errorMsg);
      }

      questions = await questionsRes.json();
      denominations = await denominationsRes.json();

      if (questions.length === 0 || denominations.length === 0) {
        throw new Error("Dados do quiz estão vazios ou incompletos.");
      }

      loadQuestionsHtml();
    } catch (error) {
      console.error("Erro ao carregar dados do quiz:", error);
      if (quizContainer) {
        quizContainer.innerHTML = `<p style='color: red; text-align: center;'>Desculpe, não foi possível carregar os dados do quiz. Verifique o console para mais detalhes e tente recarregar a página. (${error.message})</p>`;
        quizContainer.style.display = "block";
      }
      if (loader) loader.style.display = "none";
      if (submitButton) submitButton.style.display = "none";
    } finally {
      if (loader) loader.style.display = "none";
      if (quizContainer && questions.length > 0)
        quizContainer.style.display = "block";
      if (submitButton && questions.length > 0)
        submitButton.style.display = "block";
    }
  }

  function loadQuestionsHtml() {
    if (!quizContainer) return;
    quizContainer.innerHTML = "";
    questions.forEach((q) => {
      const questionBlock = document.createElement("div");
      questionBlock.classList.add("question-block");
      const questionTitle = document.createElement("h3");
      questionTitle.textContent = q.text;
      questionBlock.appendChild(questionTitle);
      q.options.forEach((opt) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = q.id;
        radio.value = opt.value;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(opt.text));
        questionBlock.appendChild(label);
      });
      quizContainer.appendChild(questionBlock);
    });
  }

  function calculateResults() {
    const answers = {};
    let answeredCount = 0;
    questions.forEach((q) => {
      const selectedOption = document.querySelector(
        `input[name="${q.id}"]:checked`
      );
      if (selectedOption) {
        answers[q.id] = selectedOption.value;
        answeredCount++;
      }
    });

    if (answeredCount === 0) {
      if (resultsOutput)
        resultsOutput.innerHTML =
          "<p>Por favor, responda a pelo menos uma pergunta para ver os resultados.</p>";
      if (resultsContainer) resultsContainer.style.display = "block";
      if (shareImageContainer) shareImageContainer.style.display = "none";
      if (resultsContainer)
        resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const scores = {};
    denominations.forEach((denom) => {
      scores[denom.name] = 0;
      for (const questionId in denom.beliefs) {
        if (
          answers[questionId] &&
          answers[questionId] === denom.beliefs[questionId]
        ) {
          scores[denom.name]++;
        }
      }
    });

    const sortedDenominations = Object.entries(scores)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    displayResults(sortedDenominations, answeredCount, answers);
  }

  async function displayResults(sortedScores, totalUserAnswers, userAnswers) {
    if (resultsOutput) resultsOutput.innerHTML = "";
    if (resultCardContent) resultCardContent.innerHTML = "";

    let pageOutputHtml =
      "<p>Com base nas suas respostas, as denominações mais alinhadas são:</p><ul>";
    let cardOutputHtml =
      '<p style="margin-bottom: 15px; font-size: 20px; text-align:center;">Minhas maiores afinidades:</p><ul style="list-style: none; padding: 0;">';

    const scoresArray = Object.entries(sortedScores);
    let displayedCountOnPage = 0;
    const topResultsForImage = [];
    const maxItemsToShowOnPage = 5;
    const maxItemsForImage = 3;

    if (scoresArray.length === 0 && totalUserAnswers > 0) {
      const noDataMsg =
        "<li>Não há dados de denominações configurados para comparação.</li>";
      pageOutputHtml += noDataMsg;
      cardOutputHtml += `<li style="padding: 8px; text-align: center;">${noDataMsg.replace(
        /<[^>]+>/g,
        ""
      )}</li>`;
    } else if (totalUserAnswers > 0) {
      const highestScore = scoresArray.length > 0 ? scoresArray[0][1] : 0;
      let thresholdScore =
        (scoresArray[maxItemsToShowOnPage - 1] &&
          scoresArray[maxItemsToShowOnPage - 1][1]) ||
        0;

      for (let i = 0; i < scoresArray.length; i++) {
        const [denomName, currentScore] = scoresArray[i];
        let questionsUserAnsweredAndDenomHas = 0;
        let matchPercentage = 0;
        const denomProfile = denominations.find((d) => d.name === denomName);

        if (denomProfile) {
          let matchedAnswersForDenom = 0;
          for (const questionId in userAnswers) {
            if (denomProfile.beliefs[questionId] !== undefined) {
              questionsUserAnsweredAndDenomHas++;
              if (
                userAnswers[questionId] === denomProfile.beliefs[questionId]
              ) {
                matchedAnswersForDenom++;
              }
            }
          }
          matchPercentage =
            questionsUserAnsweredAndDenomHas > 0
              ? Math.round(
                  (matchedAnswersForDenom / questionsUserAnsweredAndDenomHas) *
                    100
                )
              : 0;
        }

        if (
          displayedCountOnPage < maxItemsToShowOnPage ||
          currentScore === thresholdScore ||
          currentScore === highestScore
        ) {
          if (currentScore >= 0) {
            if (
              displayedCountOnPage < maxItemsToShowOnPage ||
              currentScore === thresholdScore
            ) {
              pageOutputHtml += `<li><strong>${denomName}</strong>: ${currentScore} ponto(s) correspondente(s). `;
              if (questionsUserAnsweredAndDenomHas > 0) {
                pageOutputHtml += `(${matchPercentage}% de alinhamento com as crenças desta denominação para as perguntas relevantes que você respondeu).`;
              }
              pageOutputHtml += `</li>`;
              displayedCountOnPage++;
            }
          }
        }

        let imageThresholdScore =
          topResultsForImage[maxItemsForImage - 1] &&
          topResultsForImage[maxItemsForImage - 1].score;
        if (
          topResultsForImage.length < maxItemsForImage ||
          (imageThresholdScore !== undefined &&
            currentScore === imageThresholdScore &&
            topResultsForImage.length < 5)
        ) {
          if (currentScore >= 0) {
            topResultsForImage.push({
              name: denomName,
              score: currentScore,
              percentage: matchPercentage,
            });
          }
        }
      } 
      
      topResultsForImage.sort((a, b) => {
        if (b.score === a.score) return a.name.localeCompare(b.name);
        return b.score - a.score;
      });
      if (topResultsForImage.length > maxItemsForImage) {
        const cutoffScore = topResultsForImage[maxItemsForImage - 1].score;
        let lastIndex = maxItemsForImage;
        while (
          lastIndex < topResultsForImage.length &&
          topResultsForImage[lastIndex].score === cutoffScore
        ) {
          lastIndex++;
        }
        
        topResultsForImage.length = Math.min(lastIndex, maxItemsForImage + 1); 
      }

      if (
        topResultsForImage.length === 0 &&
        totalUserAnswers > 0 &&
        scoresArray.length > 0
      ) {
        const [firstName, firstScore] = scoresArray[0];
        let firstMatchPercentage = 0;
        const firstDenomProfile = denominations.find(
          (d) => d.name === firstName
        );
        if (firstDenomProfile) {
          let matchedAnswersForDenom = 0;
          let questionsUserAnsweredAndDenomHasFirst = 0;
          for (const questionId in userAnswers) {
            if (firstDenomProfile.beliefs[questionId] !== undefined) {
              questionsUserAnsweredAndDenomHasFirst++;
              if (
                userAnswers[questionId] ===
                firstDenomProfile.beliefs[questionId]
              ) {
                matchedAnswersForDenom++;
              }
            }
          }
          firstMatchPercentage =
            questionsUserAnsweredAndDenomHasFirst > 0
              ? Math.round(
                  (matchedAnswersForDenom /
                    questionsUserAnsweredAndDenomHasFirst) *
                    100
                )
              : 0;
        }
        topResultsForImage.push({
          name: firstName,
          score: firstScore,
          percentage: firstMatchPercentage,
        });
      }

      topResultsForImage.forEach((item) => {
        cardOutputHtml += `<li style="padding: 10px 15px; background-color: #FBF9F6; border-radius: 6px; margin-bottom: 10px; border-left: 5px solid #795548; font-size: 18px;">
                                     <strong style="color: #5D4037; font-size: 20px;">${item.name}</strong> - ${item.percentage}% de afinidade
                                   </li>`;
      });

      if (displayedCountOnPage === 0 && totalUserAnswers > 0) {
        const fallbackMsg =
          "<li>Não foi possível determinar uma afinidade clara com os perfis disponíveis com base nas suas respostas. Considere refazer o quiz ou explorar as denominações individualmente.</li>";
        pageOutputHtml += fallbackMsg;
        if (topResultsForImage.length === 0) {
          cardOutputHtml += `<li style="padding: 8px; text-align: center;">${fallbackMsg.replace(
            /<[^>]+>/g,
            ""
          )}</li>`;
        }
      }
    }

    pageOutputHtml += "</ul>";
    pageOutputHtml +=
      "<p><em>Lembre-se: Este é um quiz simplificado. Conhecer sua linha teológica leva tempo. Consulte também pessoas de diversas comunidades.</em></p>";

    if (resultCardContent) resultCardContent.innerHTML = cardOutputHtml;
    if (resultsOutput) resultsOutput.innerHTML = pageOutputHtml;

    if (resultsContainer) resultsContainer.style.display = "block";
    if (shareImageContainer) shareImageContainer.style.display = "block";
    if (downloadImageLink) downloadImageLink.style.display = "none"; 
    if (copyImageBtn) copyImageBtn.style.display = "none";
    if (resultImagePreviewArea)
      resultImagePreviewArea.innerHTML =
        "<p><i>Gerando imagem do resultado...</i></p>";

    await generateImage();

    if (resultsContainer)
      resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function generateImage() {
    if (
      !resultCardForImage ||
      !html2canvas ||
      !resultImagePreviewArea ||
      !downloadImageLink ||
      !copyImageBtn
    ) {
      console.error(
        "Elementos necessários para gerar/compartilhar imagem não encontrados."
      );
      if (resultImagePreviewArea)
        resultImagePreviewArea.innerHTML =
          '<p style="color: red;">Erro: Elementos da página ausentes para gerar a imagem.</p>';
      return;
    }

    downloadImageLink.style.display = "none";
    copyImageBtn.style.display = "none";
    copyImageBtn.disabled = false; 
    copyImageBtn.textContent = "Copiar Imagem"; 

    resultCardForImage.style.display = "block";
    resultCardForImage.style.position = "absolute";
    resultCardForImage.style.left = "-9999px";
    await new Promise((resolve) => setTimeout(resolve, 250));

    try {
      const canvas = await html2canvas(resultCardForImage, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#F8F0E6",
        logging: false,
        windowWidth: resultCardForImage.scrollWidth,
        windowHeight: resultCardForImage.scrollHeight,
      });

      resultCardForImage.style.display = "none";
      resultCardForImage.style.position = "static";
      resultCardForImage.style.left = "auto";

      currentImageDataUrl = canvas.toDataURL("image/png"); 

      const imgPreview = document.createElement("img");
      imgPreview.src = currentImageDataUrl;
      imgPreview.style.maxWidth = "100%";
      imgPreview.style.maxHeight = "450px";
      imgPreview.style.border = "1px solid #A1887F";
      imgPreview.style.borderRadius = "5px";
      imgPreview.alt = "Prévia do resultado do quiz";
      resultImagePreviewArea.innerHTML = "";
      resultImagePreviewArea.appendChild(imgPreview);

      downloadImageLink.href = currentImageDataUrl;
      downloadImageLink.download = "meu_resultado_quiz_denominacional.png";
      downloadImageLink.style.display = "inline-block";
      copyImageBtn.style.display = "inline-block";
    } catch (error) {
      console.error("Erro ao gerar a imagem com html2canvas:", error);
      resultImagePreviewArea.innerHTML =
        '<p style="color: red;">Erro ao gerar a imagem. Verifique o console.</p>';
      resultCardForImage.style.display = "none";
      resultCardForImage.style.position = "static";
      resultCardForImage.style.left = "auto";
    }
  }

  async function copyImageToClipboard() {
    if (!currentImageDataUrl) {
      alert("A imagem do resultado ainda não foi gerada. Por favor, aguarde.");
      return;
    }
    if (!navigator.clipboard || !navigator.clipboard.write) {
      alert(
        "Seu navegador não suporta a cópia de imagens para a área de transferência ou a página não está em um contexto seguro (HTTPS/Localhost). Use o botão 'Baixar Imagem'."
      );
      return;
    }

    try {
      const response = await fetch(currentImageDataUrl);
      const blob = await response.blob();

      const item = new ClipboardItem({ [blob.type]: blob });

      await navigator.clipboard.write([item]);

      copyImageBtn.textContent = "Copiado!";
      copyImageBtn.disabled = true;
      setTimeout(() => {
        copyImageBtn.textContent = "Copiar Imagem";
        copyImageBtn.disabled = false;
      }, 2000); 
    } catch (err) {
      console.error(
        "Falha ao copiar imagem para a área de transferência: ",
        err
      );
      alert(
        'Não foi possível copiar a imagem. Verifique as permissões do navegador ou use o botão "Baixar Imagem".'
      );
      copyImageBtn.textContent = "Copiar Imagem";
      copyImageBtn.disabled = false;
    }
  }

  await loadQuizData();

  if (submitButton) {
    submitButton.addEventListener("click", calculateResults);
  } else {
    console.error("Botão de submissão não encontrado.");
  }

  if (copyImageBtn) {
    copyImageBtn.addEventListener("click", copyImageToClipboard);
  } else {
    console.error("Botão de copiar imagem não encontrado.");
  }
});
