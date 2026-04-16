# BOM Manager — Geliştirici Kuralları

## Mevcut Versiyon

**v2.8.0** — Proje dizini: `D:\proje\BOM\v2.1\bom-manager`

## Uygulamayı Çalıştırma

`ELECTRON_RUN_AS_NODE` ortam değişkeni sisteme kalıcı set edilmiş olabilir.
Doğrudan `electron.exe .` çalıştırırsan `TypeError: Cannot read properties of undefined (reading 'whenReady')` hatası alırsın.

**Her zaman şu PowerShell komutuyla çalıştır:**

```powershell
powershell -Command "$env:ELECTRON_RUN_AS_NODE = ''; Start-Process -FilePath 'D:\proje\BOM\v2.1\bom-manager\node_modules\electron\dist\electron.exe' -ArgumentList '.' -WorkingDirectory 'D:\proje\BOM\v2.1\bom-manager'"
```

Ya da `start.bat` ile:
```
cd /d D:\proje\BOM\v2.1\bom-manager
start.bat
```

`start.bat` içinde `set ELECTRON_RUN_AS_NODE=` ile değişken sıfırlanır.

## Versiyon Kuralları

- Her yeni özellik veya düzeltmede `package.json` içindeki `version` alanını artır
- Commit mesajı: `feat: açıklama — vX.X.X` veya `fix: açıklama — vX.X.X`
- CLAUDE.md içindeki "Mevcut Versiyon" satırını da güncelle

## Git

- Repo: https://github.com/mkupeli/bom-manager
- Branch: master
- Her değişiklikten sonra push et
