import os
import subprocess
import tempfile
import logging
import datetime
from jinja2 import Environment, BaseLoader
import math

logger = logging.getLogger(__name__)

REPORTS_DIR = os.getenv("REPORTS_DIR", "/app/reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

LATEX_TEMPLATE = r"""
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{array}
\usepackage{fancyhdr}
\usepackage{hyperref}
\usepackage{tikz}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\usetikzlibrary{patterns}
\geometry{margin=2.5cm}
\definecolor{dnagreen}{RGB}{34,139,34}
\definecolor{dnablue}{RGB}{0,102,204}
\definecolor{nucleotideA}{RGB}{255,99,71}
\definecolor{nucleotideC}{RGB}{30,144,255}
\definecolor{nucleotideG}{RGB}{50,205,50}
\definecolor{nucleotideT}{RGB}{255,165,0}
\pagestyle{fancy}
\fancyhf{}
\rhead{DNA Steganography Report}
\lhead{\textcolor{dnagreen}{BioEncode}}
\rfoot{Page \thepage}
\lfoot{\textcolor{gray}{\small Generated: {{ generation_date }}}}
\begin{document}
\begin{titlepage}
\centering
{\Huge\textbf{\textcolor{dnagreen}{DNA Steganography}}\par}
{\Large\textbf{Analysis Report}\par}
\vspace{1cm}
\begin{tikzpicture}
\foreach \i in {0,1,...,15} {
    \pgfmathsetmacro{\angle}{(\i * 22.5)}
    \pgfmathsetmacro{\x}{2*cos(\angle)}
    \pgfmathsetmacro{\y}{\i * 0.3}
    \pgfmathsetmacro{\coloridx}{mod(\i,4)}
    \ifnum\i=0 \fill[nucleotideA] (\x, \y) circle (4pt); \fi
    \ifnum\i=1 \fill[nucleotideC] (\x, \y) circle (4pt); \fi
    \ifnum\i=2 \fill[nucleotideG] (\x, \y) circle (4pt); \fi
    \ifnum\i=3 \fill[nucleotideT] (\x, \y) circle (4pt); \fi
    \ifnum\i=4 \fill[nucleotideA] (\x, \y) circle (4pt); \fi
    \ifnum\i=5 \fill[nucleotideC] (\x, \y) circle (4pt); \fi
    \ifnum\i=6 \fill[nucleotideG] (\x, \y) circle (4pt); \fi
    \ifnum\i=7 \fill[nucleotideT] (\x, \y) circle (4pt); \fi
    \ifnum\i=8 \fill[nucleotideA] (\x, \y) circle (4pt); \fi
    \ifnum\i=9 \fill[nucleotideC] (\x, \y) circle (4pt); \fi
    \ifnum\i=10 \fill[nucleotideG] (\x, \y) circle (4pt); \fi
    \ifnum\i=11 \fill[nucleotideT] (\x, \y) circle (4pt); \fi
    \ifnum\i=12 \fill[nucleotideA] (\x, \y) circle (4pt); \fi
    \ifnum\i=13 \fill[nucleotideC] (\x, \y) circle (4pt); \fi
    \ifnum\i=14 \fill[nucleotideG] (\x, \y) circle (4pt); \fi
    \ifnum\i=15 \fill[nucleotideT] (\x, \y) circle (4pt); \fi
}
\end{tikzpicture}
\vspace{1cm}
{\large Report ID: \texttt{{ '{{' }} {{ report_id }} {{ '}}' }}\par}
{\large User: \texttt{{ '{{' }} {{ user_id }} {{ '}}' }}\par}
\end{titlepage}
\tableofcontents
\newpage
\section{Executive Summary}
This report provides a comprehensive analysis of the DNA steganography encoding operation.
The input file was successfully encoded into a DNA nucleotide sequence using the binary 2-bit
encoding scheme, where each nucleotide (A, C, G, T) represents two bits of data.
\section{Source File Information}
\begin{tabular}{ll}
\toprule
\textbf{Parameter} & \textbf{Value} \\
\midrule
Original Filename & \texttt{{ '{{' }} {{ original_filename }} {{ '}}' }} \\
Original File Size & {{ original_file_size }} bytes \\
Encoding Method & Binary 2-bit (A=00, C=01, G=10, T=11) \\
\bottomrule
\end{tabular}
\section{DNA Sequence Statistics}
\subsection{Sequence Overview}
\begin{tabular}{ll}
\toprule
\textbf{Metric} & \textbf{Value} \\
\midrule
Total Sequence Length & {{ sequence_length }} nucleotides \\
GC Content & {{ gc_content }}\% \\
AT Content & {{ at_content }}\% \\
Adenine (A) Count & {{ count_a }} \\
Cytosine (C) Count & {{ count_c }} \\
Guanine (G) Count & {{ count_g }} \\
Thymine (T) Count & {{ count_t }} \\
\bottomrule
\end{tabular}
\subsection{Nucleotide Distribution}
\begin{tikzpicture}
\begin{axis}[
    ybar,
    bar width=1.2cm,
    width=12cm,
    height=7cm,
    ylabel={Count},
    xlabel={Nucleotide},
    symbolic x coords={A,C,G,T},
    xtick=data,
    ymin=0,
    title={Nucleotide Distribution},
    nodes near coords,
    nodes near coords align={vertical},
]
\addplot[fill=nucleotideA] coordinates {(A,{{ count_a }})};
\addplot[fill=nucleotideC] coordinates {(C,{{ count_c }})};
\addplot[fill=nucleotideG] coordinates {(G,{{ count_g }})};
\addplot[fill=nucleotideT] coordinates {(T,{{ count_t }})};
\end{axis}
\end{tikzpicture}
\section{DNA Sequence Preview}
The first 200 nucleotides of the encoded sequence:
\begin{verbatim}
{{ dna_preview }}
\end{verbatim}
\section{Encoding Method}
The binary 2-bit encoding scheme maps each pair of bits to a nucleotide:
\begin{center}
\begin{tabular}{cc}
\toprule
\textbf{Bit Pair} & \textbf{Nucleotide} \\
\midrule
00 & A (Adenine) \\
01 & C (Cytosine) \\
10 & G (Guanine) \\
11 & T (Thymine) \\
\bottomrule
\end{tabular}
\end{center}
This encoding achieves a data density of 2 bits per nucleotide, or 0.25 bytes per nucleotide.
\section{Quality Metrics}
\begin{itemize}
    \item \textbf{Encoding Efficiency:} Each byte of original data becomes 4 nucleotides
    \item \textbf{Sequence Integrity:} Validated against invalid nucleotide characters
    \item \textbf{GC Balance:} {{ gc_content }}\% GC content (ideal range: 40-60\%)
    \item \textbf{Estimated Storage:} {{ estimated_storage }} bytes as plain text
\end{itemize}
\end{document}
"""

def escape_latex(text: str) -> str:
    if not text:
        return ""
    replacements = [
        ("\\", r"\textbackslash{}"),
        ("&", r"\&"),
        ("%", r"\%"),
        ("$", r"\$"),
        ("#", r"\#"),
        ("_", r"\_"),
        ("{", r"\{"),
        ("}", r"\}"),
        ("~", r"\textasciitilde{}"),
        ("^", r"\textasciicircum{}"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text

def generate_latex_report(dna_preview: str, stats: dict, user_id: str) -> str:
    import uuid
    report_id = str(uuid.uuid4())[:8]
    counts = stats.get("nucleotide_counts", {"A": 0, "C": 0, "G": 0, "T": 0})
    sequence_length = stats.get("sequence_length", len(dna_preview))
    context = {
        "report_id": report_id,
        "user_id": escape_latex(user_id[:8] + "..."),
        "generation_date": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "original_filename": escape_latex(stats.get("original_filename", "unknown")),
        "original_file_size": stats.get("original_file_size_bytes", stats.get("original_file_size", 0)),
        "sequence_length": sequence_length,
        "gc_content": stats.get("gc_content", 0.0),
        "at_content": stats.get("at_content", 0.0),
        "count_a": counts.get("A", 0),
        "count_c": counts.get("C", 0),
        "count_g": counts.get("G", 0),
        "count_t": counts.get("T", 0),
        "dna_preview": dna_preview[:200],
        "estimated_storage": sequence_length
    }
    env = Environment(loader=BaseLoader(), variable_start_string="{{ '{{' }} ", variable_end_string=" {{ '}}' }}")
    simplified_template = LATEX_TEMPLATE
    for key, value in context.items():
        placeholder = "{{ " + key + " }}"
        simplified_template = simplified_template.replace(placeholder, str(value))
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_file = os.path.join(tmpdir, "report.tex")
        with open(tex_file, "w", encoding="utf-8") as f:
            f.write(simplified_template)
        try:
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdir, tex_file],
                capture_output=True,
                text=True,
                timeout=60
            )
            subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdir, tex_file],
                capture_output=True,
                text=True,
                timeout=60
            )
            pdf_src = os.path.join(tmpdir, "report.pdf")
            if os.path.exists(pdf_src):
                pdf_filename = f"report_{report_id}_{user_id[:8]}.pdf"
                pdf_dest = os.path.join(REPORTS_DIR, pdf_filename)
                import shutil
                shutil.copy2(pdf_src, pdf_dest)
                logger.info(f"PDF report generated: {pdf_dest}")
                return pdf_dest
            else:
                logger.error(f"PDF not generated. LaTeX stdout: {result.stdout[-500:]}")
                fallback_path = os.path.join(REPORTS_DIR, f"report_{report_id}.txt")
                with open(fallback_path, "w") as f:
                    f.write(f"DNA Steganography Report\n")
                    f.write(f"Report ID: {report_id}\n")
                    f.write(f"Generated: {context['generation_date']}\n")
                    f.write(f"Sequence Length: {sequence_length}\n")
                    f.write(f"GC Content: {context['gc_content']}%\n")
                    f.write(f"AT Content: {context['at_content']}%\n")
                return fallback_path
        except subprocess.TimeoutExpired:
            logger.error("pdflatex timed out")
            raise RuntimeError("PDF generation timed out")
        except FileNotFoundError:
            logger.warning("pdflatex not found, generating text report")
            fallback_path = os.path.join(REPORTS_DIR, f"report_{report_id}.txt")
            with open(fallback_path, "w") as f:
                f.write("DNA Steganography Report\n")
                f.write("=" * 50 + "\n")
                for key, value in context.items():
                    f.write(f"{key}: {value}\n")
            return fallback_path