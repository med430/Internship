@echo off
echo Compilation du rapport Stagio...
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
echo.
echo Compilation terminee. Ouvrir main.pdf
pause
