# BOM Manager — Geliştirici Kuralları

## Mevcut Versiyon

**v2.11.0** — Proje dizini: `D:\proje\BOM\v2.8\bom-manager`

## Uygulamayı Çalıştırma

`ELECTRON_RUN_AS_NODE` ortam değişkeni sisteme kalıcı set edilmiş olabilir.
Doğrudan `electron.exe .` çalıştırırsan `TypeError: Cannot read properties of undefined (reading 'whenReady')` hatası alırsın.

**Her zaman şu PowerShell komutuyla çalıştır:**

```powershell
powershell -Command "& { [System.Environment]::SetEnvironmentVariable('ELECTRON_RUN_AS_NODE', '', 'Process'); Start-Process -FilePath 'D:\projeler\bom-manager\node_modules\electron\dist\electron.exe' -ArgumentList '.' -WorkingDirectory 'D:\projeler\bom-manager' }"
```

> **Not:** `$env:ELECTRON_RUN_AS_NODE = ''` sözdizimi bu sistemde çalışmıyor.  
> `[System.Environment]::SetEnvironmentVariable(...)` kullan — bu kesin çalışan yöntemdir.

Ya da `start.bat` ile (proje dizininden):
```
start.bat
```

`start.bat` içinde `set ELECTRON_RUN_AS_NODE=` ile değişken sıfırlanır.

### Uygulama açılmıyorsa

`cmd /c "set ELECTRON_RUN_AS_NODE= && start electron.exe ."` gibi yöntemler bu sistemde **çalışmayabilir** (ortam değişkeni alt prosese geçmiyor). Açılmadığında doğrudan şunu dene:

```powershell
powershell -Command "& { [System.Environment]::SetEnvironmentVariable('ELECTRON_RUN_AS_NODE', '', 'Process'); Start-Process -FilePath 'D:\projeler\bom-manager\node_modules\electron\dist\electron.exe' -ArgumentList '.' -WorkingDirectory 'D:\projeler\bom-manager' }"
```

## Versiyon Kuralları

- Her yeni özellik veya düzeltmede `package.json` içindeki `version` alanını artır
- Commit mesajı: `feat: açıklama — vX.X.X` veya `fix: açıklama — vX.X.X`
- CLAUDE.md içindeki "Mevcut Versiyon" satırını da güncelle

### Versiyon değişikliğinde kontrol listesi

Her versiyon artışında şu **üç yerin** birbiriyle eşleştiğini doğrula:

1. `package.json` → `"version"` alanı
2. `src/index.html` → `BOM Manager vX.X` ifadesinin geçtiği tüm yerler  
   (arama: `grep -i "bom manager v" src/index.html`)
3. `src/index.html` → titlebar etiketi: `BOM MANAGER vX.X`  
   (arama: `grep -i "titlebar-text" src/index.html`)

Eşleşmiyorsa `src/index.html` içindeki tüm eski versiyon etiketlerini güncelle.

## Git

- Repo: https://github.com/mkupeli/bom-manager
- Branch: master
- Her değişiklikten sonra push et
