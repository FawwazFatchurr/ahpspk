let criteria = [];
        let alternatives = [];
        let criteriaMatrix = [];
        let criteriaWeights = [];
        let alternativeMatrices = {};
        let alternativeScores = {};

        function addCriteria() {
            const input = document.getElementById('criteriaInput');
            const criteriaName = input.value.trim();
            
            if (criteriaName && !criteria.includes(criteriaName)) {
                criteria.push(criteriaName);
                updateCriteriaDisplay();
                generateCriteriaMatrix();
                input.value = '';
            }
        }

        function addAlternative() {
            const input = document.getElementById('alternativeInput');
            const alternativeName = input.value.trim();
            
            if (alternativeName && !alternatives.includes(alternativeName)) {
                alternatives.push(alternativeName);
                updateAlternativesDisplay();
                generateAlternativeMatrices();
                input.value = '';
            }
        }

        function removeCriteria(index) {
            criteria.splice(index, 1);
            updateCriteriaDisplay();
            generateCriteriaMatrix();
        }

        function removeAlternative(index) {
            alternatives.splice(index, 1);
            updateAlternativesDisplay();
            generateAlternativeMatrices();
        }

        function updateCriteriaDisplay() {
            const container = document.getElementById('criteriaList');
            container.innerHTML = '';
            
            criteria.forEach((criterion, index) => {
                const item = document.createElement('div');
                item.className = 'criteria-item';
                item.innerHTML = `
                    ${criterion}
                    <button class="remove-btn" onclick="removeCriteria(${index})">×</button>
                `;
                container.appendChild(item);
            });
        }

        function updateAlternativesDisplay() {
            const container = document.getElementById('alternativesList');
            container.innerHTML = '';
            
            alternatives.forEach((alternative, index) => {
                const item = document.createElement('div');
                item.className = 'alternative-item';
                item.innerHTML = `
                    ${alternative}
                    <button class="remove-btn" onclick="removeAlternative(${index})">×</button>
                `;
                container.appendChild(item);
            });
        }

        function generateCriteriaMatrix() {
            if (criteria.length < 2) return;

            const table = document.getElementById('criteriaMatrix');
            table.innerHTML = '';

            // Header
            const headerRow = table.insertRow();
            headerRow.insertCell().innerHTML = '<strong>Kriteria</strong>';
            criteria.forEach(criterion => {
                const cell = headerRow.insertCell();
                cell.innerHTML = `<strong>${criterion}</strong>`;
            });

            // Matrix rows
            criteriaMatrix = [];
            for (let i = 0; i < criteria.length; i++) {
                criteriaMatrix[i] = [];
                const row = table.insertRow();
                row.insertCell().innerHTML = `<strong>${criteria[i]}</strong>`;
                
                for (let j = 0; j < criteria.length; j++) {
                    const cell = row.insertCell();
                    if (i === j) {
                        cell.innerHTML = '<strong>1</strong>';
                        cell.style.background = '#f0f0f0';
                        criteriaMatrix[i][j] = 1;
                    } else {
                        const select = document.createElement('select');
                        select.id = `criteria_${i}_${j}`;
                        select.innerHTML = `
                            <option value="0.111">1/9</option>
                                <option value="0.125">1/8</option>
                                <option value="0.143">1/7</option>
                                <option value="0.167">1/6</option>
                                <option value="0.2">1/5</option>
                                <option value="0.25">1/4</option>
                                <option value="0.333">1/3</option>
                                <option value="0.5">1/2</option>
                                <option value="1" selected>1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                        `;
                        select.onchange = () => updateCriteriaMatrix(i, j, parseFloat(select.value));
                        cell.appendChild(select);
                        criteriaMatrix[i][j] = 1;
                    }
                }
            }
        }

        function updateCriteriaMatrix(i, j, value) {
            criteriaMatrix[i][j] = value;
            // Update the corresponding reciprocal value
            criteriaMatrix[j][i] = 1 / value;
            
            // Update the dropdown on the reciprocal position
            const reciprocalSelect = document.getElementById(`criteria_${j}_${i}`);
            if (reciprocalSelect) {
                reciprocalSelect.value = (1/value).toFixed(3);
                // If the reciprocal value doesn't exist in options, select the closest one
                let closestOption = null;
                let closestDiff = Infinity;
                
                for (let option of reciprocalSelect.options) {
                    const diff = Math.abs(parseFloat(option.value) - (1/value));
                    if (diff < closestDiff) {
                        closestDiff = diff;
                        closestOption = option;
                    }
                }
                if (closestOption) {
                    reciprocalSelect.value = closestOption.value;
                }
            }
        }

        function calculateCriteriaWeights() {
            if (criteria.length < 2) return;

            // Normalize matrix and calculate weights
            const colSums = [];
            for (let j = 0; j < criteria.length; j++) {
                colSums[j] = 0;
                for (let i = 0; i < criteria.length; i++) {
                    colSums[j] += criteriaMatrix[i][j];
                }
            }

            const normalizedMatrix = [];
            criteriaWeights = [];
            
            for (let i = 0; i < criteria.length; i++) {
                normalizedMatrix[i] = [];
                criteriaWeights[i] = 0;
                for (let j = 0; j < criteria.length; j++) {
                    normalizedMatrix[i][j] = criteriaMatrix[i][j] / colSums[j];
                    criteriaWeights[i] += normalizedMatrix[i][j];
                }
                criteriaWeights[i] /= criteria.length;
            }

            displayCriteriaWeights();
            generateAlternativeMatrices();
        }

        function displayCriteriaWeights() {
            const container = document.getElementById('criteriaWeights');
            container.innerHTML = '<h3>Bobot Kriteria:</h3>';
            
            criteria.forEach((criterion, index) => {
                const weight = criteriaWeights[index];
                const percentage = (weight * 100).toFixed(2);
                
                const item = document.createElement('div');
                item.className = 'result-item';
                item.innerHTML = `
                    <span><strong>${criterion}</strong></span>
                    <div style="display: flex; align-items: center;">
                        <span class="result-score">${percentage}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        function generateAlternativeMatrices() {
            if (alternatives.length < 2 || criteriaWeights.length === 0) return;

            const container = document.getElementById('alternativeMatrices');
            container.innerHTML = '';

            criteria.forEach((criterion, criterionIndex) => {
                const section = document.createElement('div');
                section.style.marginBottom = '30px';
                
                const title = document.createElement('h3');
                title.textContent = `Perbandingan Alternatif untuk Kriteria: ${criterion}`;
                title.style.marginBottom = '15px';
                section.appendChild(title);

                const table = document.createElement('table');
                table.className = 'matrix-table';
                
                // Header
                const headerRow = table.insertRow();
                headerRow.insertCell().innerHTML = '<strong>Alternatif</strong>';
                alternatives.forEach(alternative => {
                    const cell = headerRow.insertCell();
                    cell.innerHTML = `<strong>${alternative}</strong>`;
                });

                // Initialize matrix for this criterion
                alternativeMatrices[criterionIndex] = [];
                
                // Matrix rows
                for (let i = 0; i < alternatives.length; i++) {
                    alternativeMatrices[criterionIndex][i] = [];
                    const row = table.insertRow();
                    row.insertCell().innerHTML = `<strong>${alternatives[i]}</strong>`;
                    
                    for (let j = 0; j < alternatives.length; j++) {
                        const cell = row.insertCell();
                        if (i === j) {
                            cell.innerHTML = '<strong>1</strong>';
                            cell.style.background = '#f0f0f0';
                            alternativeMatrices[criterionIndex][i][j] = 1;
                        } else {
                            const select = document.createElement('select');
                            select.id = `alt_${criterionIndex}_${i}_${j}`;
                            select.innerHTML = `
                                <option value="0.111">1/9</option>
                                <option value="0.125">1/8</option>
                                <option value="0.143">1/7</option>
                                <option value="0.167">1/6</option>
                                <option value="0.2">1/5</option>
                                <option value="0.25">1/4</option>
                                <option value="0.333">1/3</option>
                                <option value="0.5">1/2</option>
                                <option value="1" selected>1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                            `;
                            select.onchange = () => updateAlternativeMatrix(criterionIndex, i, j, parseFloat(select.value));
                            cell.appendChild(select);
                            alternativeMatrices[criterionIndex][i][j] = 1;
                        }
                    }
                }

                section.appendChild(table);
                container.appendChild(section);
            });
        }

        function updateAlternativeMatrix(criterionIndex, i, j, value) {
            alternativeMatrices[criterionIndex][i][j] = value;
            // Update the corresponding reciprocal value
            alternativeMatrices[criterionIndex][j][i] = 1 / value;
            
            // Update the dropdown on the reciprocal position
            const reciprocalSelect = document.getElementById(`alt_${criterionIndex}_${j}_${i}`);
            if (reciprocalSelect) {
                // Find the closest option value to the reciprocal
                let closestOption = null;
                let closestDiff = Infinity;
                
                for (let option of reciprocalSelect.options) {
                    const diff = Math.abs(parseFloat(option.value) - (1/value));
                    if (diff < closestDiff) {
                        closestDiff = diff;
                        closestOption = option;
                    }
                }
                if (closestOption) {
                    reciprocalSelect.value = closestOption.value;
                }
            }
        }

        function calculateFinalResults() {
            if (criteriaWeights.length === 0 || Object.keys(alternativeMatrices).length === 0) {
                alert('Pastikan Anda telah mengisi semua matriks perbandingan!');
                return;
            }

            // Calculate scores for each alternative for each criterion
            alternativeScores = {};
            
            criteria.forEach((criterion, criterionIndex) => {
                if (!alternativeMatrices[criterionIndex]) return;
                
                // Normalize alternative matrix for this criterion
                const colSums = [];
                for (let j = 0; j < alternatives.length; j++) {
                    colSums[j] = 0;
                    for (let i = 0; i < alternatives.length; i++) {
                        colSums[j] += alternativeMatrices[criterionIndex][i][j];
                    }
                }

                const normalizedMatrix = [];
                const scores = [];
                
                for (let i = 0; i < alternatives.length; i++) {
                    normalizedMatrix[i] = [];
                    scores[i] = 0;
                    for (let j = 0; j < alternatives.length; j++) {
                        normalizedMatrix[i][j] = alternativeMatrices[criterionIndex][i][j] / colSums[j];
                        scores[i] += normalizedMatrix[i][j];
                    }
                    scores[i] /= alternatives.length;
                    
                    if (!alternativeScores[alternatives[i]]) {
                        alternativeScores[alternatives[i]] = 0;
                    }
                    alternativeScores[alternatives[i]] += scores[i] * criteriaWeights[criterionIndex];
                }
            });

            displayFinalResults();
        }

        function displayFinalResults() {
            const container = document.getElementById('finalResults');
            container.innerHTML = '<h3>🏆 Hasil Perangkingan:</h3>';

            // Sort alternatives by score
            const sortedAlternatives = Object.entries(alternativeScores)
                .sort((a, b) => b[1] - a[1]);

            const maxScore = Math.max(...Object.values(alternativeScores));

            sortedAlternatives.forEach(([alternative, score], index) => {
                const percentage = (score * 100).toFixed(2);
                const normalizedPercentage = ((score / maxScore) * 100).toFixed(0);
                
                const item = document.createElement('div');
                item.className = 'result-item';
                item.innerHTML = `
                    <span><strong>${index + 1}. ${alternative}</strong></span>
                    <div style="display: flex; align-items: center;">
                        <span class="result-score">${percentage}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${normalizedPercentage}%"></div>
                        </div>
                    </div>
                `;
                container.appendChild(item);
            });

            // Add recommendation
            if (sortedAlternatives.length > 0) {
                const recommendation = document.createElement('div');
                recommendation.style.marginTop = '20px';
                recommendation.style.padding = '20px';
                recommendation.style.background = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
                recommendation.style.color = 'white';
                recommendation.style.borderRadius = '10px';
                recommendation.style.textAlign = 'center';
                recommendation.innerHTML = `
                    <h3>💡 Rekomendasi</h3>
                    <p>Berdasarkan analisis AHP, <strong>${sortedAlternatives[0][0]}</strong> adalah pilihan terbaik dengan skor <strong>${(sortedAlternatives[0][1] * 100).toFixed(2)}%</strong></p>
                `;
                container.appendChild(recommendation);
            }
        }

        // Event listeners for Enter key
        document.getElementById('criteriaInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCriteria();
            }
        });

        document.getElementById('alternativeInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addAlternative();
            }
        });