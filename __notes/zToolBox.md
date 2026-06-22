<link rel="stylesheet" type="text/css" href=".css/style.css">

# ToolBox Manual

## ⚠️ Atualizar a instalação global

Se você alterar ou adicionar módulos na `toolbox`, reinstale a ferramenta:

```pwsh
    :: Caminho Relativo
    $TOOLBOX_DIR = "..\toolbox"
    :: ou Caminho Absoluto
    $TOOLBOX_DIR = "C:\Users\anton\OneDrive\Documentos\GitHub\toolbox"
    uv tool install --reinstall $TOOLBOX_DIR
```

## Caminhos úteis

- Direitório atual
```pwsh
    :: Caminho Relativo
    $REPO_ALVO = "..\int-eco--test"
    :: ou Caminho Absoluto
    $REPO_ALVO = "C:\Users\[...]\int-eco--test"
```
- Direitório da ToolBox
```pwsh
    :: Caminho Relativo
    $TOOLBOX_DIR = "..\toolbox"
    :: ou Caminho Absoluto
    $TOOLBOX_DIR = "C:\Users\[...]\toolbox"
```
- Path filtro:
```pwsh
    :: Caminho Absoluto
    $CONFIG_FILE = "..\int-eco--test\__notes\zFilter.py"
    $CONFIG_FILE = "C:\Users\anton\OneDrive\Documentos\GitHub\int-eco--test\__notes\zFilter.py"
```


## Tree

- Fluxo mínimo recomendado:

```pwsh
    $TOOLBOX_DIR = "C:\Users\anton\OneDrive\Documentos\GitHub\toolbox"   # substitua pelo seu caminho
    cd $TOOLBOX_DIR
    uv sync
    uv run toolbox list
    uv tool install $TOOLBOX_DIR
    cd $REPO_ALVO
```

- Exemplo de Uso
```pwsh
    toolbox run file_tree -- $REPO_ALVO --config $CONFIG_FILE
```

