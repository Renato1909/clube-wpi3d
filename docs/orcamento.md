# Orçamento — estado atual

A página `/orcamento` é uma demonstração interativa no visual do Clube WPI3D.

Inclui contato, endereço opcional, descrição, quantidade, material, cor, data desejada e observações. A seleção local aceita até 5 arquivos de 20 MB cada, nos formatos JPG, JPEG, PNG, WEBP, PDF, MP4, MOV, STL, 3MF e OBJ. É possível remover anexos individualmente; arquivos duplicados não são adicionados novamente.

O botão “Conferir preenchimento” valida os campos. Não há envio nem persistência: dados e arquivos são descartados ao sair ou recarregar a página. Nenhuma solicitação real é criada.

## Verificar

Execute `npm run lint` e `npm run build`. Com `npm run dev`, abra `/orcamento`, confira o bloqueio de campos vazios e teste com dados fictícios válidos. Selecione e remova arquivos e tente um formato não aceito. Verifique também em uma tela estreita.

## Próxima etapa

Conectar ao Supabase com validação no servidor, armazenamento privado de anexos e controle de acesso. Validar o conteúdo e tamanho dos arquivos também no servidor; a verificação local de extensão é apenas uma ajuda para o preenchimento. Só habilitar envio real e confirmação de recebimento após a integração funcionar. As credenciais devem ficar em variáveis de ambiente ignoradas pelo Git.
